const express = require('express');
const router = express.Router();
const { protect, authorizeAdminPosition } = require('../middleware/authMiddleware');

// All routes are protected and require Accounting admin position
router.use(protect);
router.use(authorizeAdminPosition('accounting'));

// Payment and grade access routes (Accounting admin only)
router.put('/payments/:studentId', (req, res) => {
    // TODO: Add payment status update controller function
    res.json({ message: 'Update payment status' });
});

router.put('/grade-access/:studentId', (req, res) => {
    // TODO: Add grade access update controller function
    res.json({ message: 'Update grade access' });
});

module.exports = router; 