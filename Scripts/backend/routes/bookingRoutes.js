const express = require('express');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { auth, requireOwner } = require('../middleware/authMiddleware');

const router = express.Router();

// Create booking (renter)
router.post('/', auth, async (req, res) => {
  try {
    const {
      propertyId,
      username,
      userPhone,
      userEmail,
      message,
      moveInDate,
      leaseDuration
    } = req.body;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property is available
    if (!property.isAvailable) {
      return res.status(400).json({ message: 'Property is not available' });
    }

    // Check if user already has a pending booking for this property
    const existingBooking = await Booking.findOne({
      propertyId,
      userId: req.user._id,
      status: 'pending'
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'You already have a pending booking for this property' });
    }

    const booking = new Booking({
      propertyId,
      userId: req.user._id,
      ownerId: property.userID,
      username,
      userPhone,
      userEmail,
      message,
      moveInDate,
      leaseDuration
    });

    await booking.save();

    // Populate property details for response
    await booking.populate('propertyId');
    await booking.populate('ownerId', 'name email phone');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookings (renter)
router.get('/user', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('propertyId')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get owner's bookings (owner)
router.get('/owner', auth, requireOwner, async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('propertyId')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status (owner)
router.put('/:id/status', auth, requireOwner, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // If booking is approved, mark property as unavailable
    if (status === 'approved') {
      await Property.findByIdAndUpdate(booking.propertyId, { isAvailable: false });
    }

    // If booking is rejected, mark property as available again
    if (status === 'rejected') {
      await Property.findByIdAndUpdate(booking.propertyId, { isAvailable: true });
    }

    await booking.populate('propertyId');
    await booking.populate('userId', 'name email phone');

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single booking
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('propertyId')
      .populate('userId', 'name email phone')
      .populate('ownerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.userId._id.toString() !== req.user._id.toString() && 
        booking.ownerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel booking (renter)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending bookings' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Mark property as available again
    if (booking.propertyId) {
      try {
        await Property.findByIdAndUpdate(booking.propertyId, { isAvailable: true });
      } catch (e) {
        console.error('Property update error during booking cancel:', e);
      }
    }

    await booking.populate('propertyId');
    await booking.populate('ownerId', 'name email phone');

    res.json(booking);
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 