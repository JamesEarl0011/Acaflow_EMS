const express = require('express');
const router = express.Router();
const { getStudentProfile, updateStudentProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and require student role
router.use(protect);
router.use(authorize('student'));

// Student profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

module.exports = router; 