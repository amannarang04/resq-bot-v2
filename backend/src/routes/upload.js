const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeImage } = require('../controllers/uploadController');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

router.post('/', upload.single('image'), analyzeImage);

module.exports = router;