const express = require('express');
const router = express.Router();
const { protect, authorize, authorizeAdminPosition } = require('../middleware/authMiddleware');
const { 
    updatePaymentStatus, 
    uploadStudentGrade, 
    getStudentGrades,
    uploadGradesFromFile,
    upload
} = require('../controllers/gradeController');

// Accounting admin routes
router.route('/payment/:studentId')
    .put(protect, authorizeAdminPosition('accounting'), updatePaymentStatus);

// Teacher routes
router.route('/upload')
    .post(protect, authorize('teacher'), uploadStudentGrade);

// Teacher file upload route
router.route('/upload/file')
    .post(protect, authorize('teacher'), upload.single('grades'), uploadGradesFromFile);

// Student routes
router.route('/student')
    .get(protect, authorize('student'), getStudentGrades);

module.exports = router; 