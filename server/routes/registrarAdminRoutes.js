const express = require('express');
const router = express.Router();
const { protect, authorizeAdminPosition } = require('../middleware/authMiddleware');

// All routes are protected and require Registrar admin position
router.use(protect);
router.use(authorizeAdminPosition('registrar'));

// Course evaluation routes (Registrar admin only)
router.get('/evaluations', (req, res) => {
    // TODO: Add course evaluation controller functions
    res.json({ message: 'Course evaluation routes' });
});

// Enrollment routes (Registrar admin only)
router.get('/enrollments', (req, res) => {
    // TODO: Add enrollment controller functions
    res.json({ message: 'Enrollment routes' });
});

module.exports = router; 