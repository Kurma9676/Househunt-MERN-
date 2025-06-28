const express = require('express');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { auth, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users (admin only)
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending owner approvals (admin only)
router.get('/pending-owners', auth, requireAdmin, async (req, res) => {
  try {
    const pendingOwners = await User.find({ 
      type: 'owner', 
      isApproved: false 
    }).select('-password').sort({ createdAt: -1 });
    
    res.json(pendingOwners);
  } catch (error) {
    console.error('Get pending owners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve owner (admin only)
router.put('/approve-owner/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.type !== 'owner') {
      return res.status(400).json({ message: 'User is not an owner' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'Owner approved successfully', user });
  } catch (error) {
    console.error('Approve owner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject owner (admin only)
router.delete('/reject-owner/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.type !== 'owner') {
      return res.status(400).json({ message: 'User is not an owner' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Owner rejected and deleted successfully' });
  } catch (error) {
    console.error('Reject owner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all properties (admin only)
router.get('/properties', auth, requireAdmin, async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('userID', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', auth, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('propertyId')
      .populate('userId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics (admin only)
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    // Disable caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');

    const totalUsers = await User.countDocuments();
    const totalRenters = await User.countDocuments({ type: 'renter' });
    const totalOwners = await User.countDocuments({ type: 'owner' });
    const pendingOwners = await User.countDocuments({ type: 'owner', isApproved: false });
    const totalProperties = await Property.countDocuments();
    const availableProperties = await Property.countDocuments({ isAvailable: true });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    const stats = {
      totalUsers,
      totalRenters,
      totalOwners,
      pendingOwners,
      totalProperties,
      availableProperties,
      totalBookings,
      pendingBookings
    };

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's properties
    await Property.deleteMany({ userID: req.params.id });
    
    // Delete user's bookings
    await Booking.deleteMany({ 
      $or: [{ userId: req.params.id }, { ownerId: req.params.id }] 
    });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property (admin only)
router.delete('/properties/:id', auth, requireAdmin, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Delete associated bookings
    await Booking.deleteMany({ propertyId: req.params.id });

    // Delete property
    await Property.findByIdAndDelete(req.params.id);

    res.json({ message: 'Property and associated bookings deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 