const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/evidence');
(async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
})();

// Configure Multer storage
const storage = multer.memoryStorage(); // Store in memory for processing with Sharp

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG images are allowed'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 5 // Max 5 files
  }
});

// Middleware to process images with Sharp
async function processImages(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const processedFiles = [];
  const { anonymousId } = req.body;

  try {
    for (const file of req.files) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const filename = `${anonymousId || 'anonymous'}_${timestamp}_${randomString}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      // Process image with Sharp:
      // - Remove EXIF metadata (privacy)
      // - Resize to max 1920x1080
      // - Compress to <1MB
      // - Convert to JPEG
      const imageBuffer = await sharp(file.buffer)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 85,
          progressive: true,
          mozjpeg: true
        })
        .toBuffer({ resolveWithObject: true });

      // Further compress if still > 1MB
      let finalBuffer = imageBuffer.data;
      let quality = 85;
      
      while (finalBuffer.length > 1024 * 1024 && quality > 50) {
        quality -= 5;
        finalBuffer = await sharp(file.buffer)
          .resize(1920, 1080, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality, progressive: true })
          .toBuffer();
      }

      // Write processed file to disk
      await fs.writeFile(filepath, finalBuffer);

      processedFiles.push({
        filename: filename,
        path: filepath,
        size: finalBuffer.length,
        originalSize: file.size,
        uploadedAt: new Date()
      });
    }

    req.processedImages = processedFiles;
    next();
  } catch (error) {
    console.error('Error processing images:', error);
    // Clean up any files that were written
    for (const file of processedFiles) {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error('Error cleaning up file:', err);
      }
    }
    return res.status(500).json({ 
      message: 'Error processing images', 
      error: error.message 
    });
  }
}

// Combined middleware: upload + process
const uploadEvidenceImages = [
  upload.array('evidence', 5),
  processImages
];

module.exports = {
  uploadEvidenceImages,
  processImages
};

