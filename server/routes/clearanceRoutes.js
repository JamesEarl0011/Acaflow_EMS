const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
    getTeacherClearances,
    updateClearanceStatus,
    getStudentClearance
} = require('../controllers/clearanceController');

// Teacher routes
router.route('/teacher')
    .get(protect, authorize('teacher'), getTeacherClearances);

router.route('/teacher/:studentId/:courseCode')
    .put(protect, authorize('teacher'), updateClearanceStatus);

// Student routes
router.route('/student')
    .get(protect, authorize('student'), getStudentClearance);

module.exports = router; 