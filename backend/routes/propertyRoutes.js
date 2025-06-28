const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const { auth, requireOwner } = require('../middleware/authMiddleware');
const Booking = require('../models/Booking');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all properties (public)
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      minPrice, 
      maxPrice, 
      city, 
      bedrooms, 
      available 
    } = req.query;

    let query = { isAvailable: true };

    if (type) query.propType = type;
    if (minPrice || maxPrice) {
      query.propAmt = {};
      if (minPrice) query.propAmt.$gte = Number(minPrice);
      if (maxPrice) query.propAmt.$lte = Number(maxPrice);
    }
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (bedrooms) query['addInfo.bedrooms'] = { $gte: Number(bedrooms) };
    if (available !== undefined) query.isAvailable = available === 'true';

    const properties = await Property.find(query)
      .populate('userID', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('userID', 'name email phone');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create property (owner only)
router.post('/', auth, requireOwner, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      if (err.message === 'Only image files are allowed!') {
        return res.status(400).json({ message: 'Only image files (jpeg, jpg, png, gif) are allowed.' });
      }
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Create property request received:', {
      body: req.body,
      files: req.files ? req.files.length : 0,
      user: req.user._id
    });

    const {
      propType,
      adType,
      address,
      propAmt,
      addInfo,
      ownerContact
    } = req.body;

    // Validate required fields
    if (!propType || !adType || !propAmt) {
      console.log('Missing required fields:', { propType, adType, propAmt });
      return res.status(400).json({ message: 'Missing required fields: propType, adType, and propAmt are required' });
    }

    // Validate property type
    const validPropTypes = ['apartment', 'house', 'room', 'studio', 'villa'];
    if (!validPropTypes.includes(propType)) {
      return res.status(400).json({ message: 'Invalid property type' });
    }

    // Validate ad type
    const validAdTypes = ['rent', 'sale'];
    if (!validAdTypes.includes(adType)) {
      return res.status(400).json({ message: 'Invalid ad type' });
    }

    // Validate price
    if (isNaN(Number(propAmt)) || Number(propAmt) <= 0) {
      return res.status(400).json({ message: 'Invalid price amount' });
    }

    let parsedAddress, parsedAddInfo, parsedOwnerContact;

    try {
      parsedAddress = JSON.parse(address);
      parsedAddInfo = JSON.parse(addInfo);
      parsedOwnerContact = JSON.parse(ownerContact);
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      return res.status(400).json({ message: 'Invalid JSON data in form fields' });
    }

    const imageFiles = req.files ? req.files.map(file => file.filename) : [];

    const property = new Property({
      userID: req.user._id,
      propType,
      adType,
      address: parsedAddress,
      propAmt: Number(propAmt),
      addInfo: parsedAddInfo,
      ownerContact: parsedOwnerContact,
      images: imageFiles
    });

    console.log('Saving property:', property);
    await property.save();
    console.log('Property saved successfully:', property._id);
    res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: validationErrors.join(', ') });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Property already exists' });
    }
    
    res.status(500).json({ message: 'Server error while creating property' });
  }
});

// Update property (owner only)
router.put('/:id', auth, requireOwner, upload.array('images', 5), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const {
      propType,
      adType,
      address,
      propAmt,
      addInfo,
      ownerContact,
      isAvailable
    } = req.body;

    const imageFiles = req.files ? req.files.map(file => file.filename) : [];

    const updateData = {
      propType,
      adType,
      address: JSON.parse(address),
      propAmt: Number(propAmt),
      addInfo: JSON.parse(addInfo),
      ownerContact: JSON.parse(ownerContact),
      isAvailable
    };

    if (imageFiles.length > 0) {
      updateData.images = imageFiles;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property (owner only)
router.delete('/:id', auth, requireOwner, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated bookings first
    await Booking.deleteMany({ propertyId: req.params.id });

    // Delete property
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's properties (owner only)
router.get('/user/properties', auth, requireOwner, async (req, res) => {
  try {
    const properties = await Property.find({ userID: req.user._id })
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Get user properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 