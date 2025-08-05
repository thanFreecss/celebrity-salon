const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BeforeAfter = require('../models/BeforeAfter');
const { protect } = require('../middleware/auth');

console.log('BeforeAfter router loaded successfully');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/before-after');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware to check if user is admin
const adminAuth = async (req, res, next) => {
    try {
        await protect(req, res, () => {});
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication required' });
    }
};

// Test route to verify the router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Before & After router is working!' });
});

// @route   POST /api/before-after/upload
// @desc    Upload before and after images (Admin only)
// @access  Private/Admin
router.post('/upload', adminAuth, upload.fields([
    { name: 'beforeImage', maxCount: 1 },
    { name: 'afterImage', maxCount: 1 }
]), async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!req.files.beforeImage || !req.files.afterImage) {
            return res.status(400).json({ message: 'Both before and after images are required' });
        }

        const beforeImagePath = req.files.beforeImage[0].filename;
        const afterImagePath = req.files.afterImage[0].filename;

        const beforeAfter = new BeforeAfter({
            beforeImage: beforeImagePath,
            afterImage: afterImagePath,
            description: description || '',
            uploadedBy: req.user.id
        });

        await beforeAfter.save();

        res.status(201).json({
            message: 'Before & After images uploaded successfully',
            data: beforeAfter
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

// @route   GET /api/before-after
// @desc    Get all before and after images (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const beforeAfterImages = await BeforeAfter.find({ isActive: true })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(beforeAfterImages);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/before-after/admin
// @desc    Get all before and after images for admin (including inactive)
// @access  Private/Admin
router.get('/admin', adminAuth, async (req, res) => {
    try {
        const beforeAfterImages = await BeforeAfter.find()
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(beforeAfterImages);
    } catch (error) {
        console.error('Admin fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/before-after/:id
// @desc    Update before and after image pair (Admin only)
// @access  Private/Admin
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { description, isActive } = req.body;
        
        const beforeAfter = await BeforeAfter.findById(req.params.id);
        if (!beforeAfter) {
            return res.status(404).json({ message: 'Before & After pair not found' });
        }

        beforeAfter.description = description || beforeAfter.description;
        beforeAfter.isActive = isActive !== undefined ? isActive : beforeAfter.isActive;

        await beforeAfter.save();

        res.json({
            message: 'Before & After pair updated successfully',
            data: beforeAfter
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/before-after/:id
// @desc    Delete before and after image pair (Admin only)
// @access  Private/Admin
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const beforeAfter = await BeforeAfter.findById(req.params.id);
        if (!beforeAfter) {
            return res.status(404).json({ message: 'Before & After pair not found' });
        }

        // Delete image files from server
        const uploadDir = path.join(__dirname, '../uploads/before-after');
        
        const beforeImagePath = path.join(uploadDir, beforeAfter.beforeImage);
        const afterImagePath = path.join(uploadDir, beforeAfter.afterImage);

        if (fs.existsSync(beforeImagePath)) {
            fs.unlinkSync(beforeImagePath);
        }
        if (fs.existsSync(afterImagePath)) {
            fs.unlinkSync(afterImagePath);
        }

        await BeforeAfter.findByIdAndDelete(req.params.id);

        res.json({ message: 'Before & After pair deleted successfully' });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/before-after/images/:filename
// @desc    Serve uploaded images
// @access  Public
router.get('/images/:filename', (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/before-after', filename);
    
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).json({ message: 'Image not found' });
    }
});

module.exports = router; 