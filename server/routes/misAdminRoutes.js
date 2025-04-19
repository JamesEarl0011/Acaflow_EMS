const express = require('express');
const router = express.Router();
const { registerUser, getUsers, getUser, updateUser, deleteUser, getUsersByRole } = require('../controllers/userController');
const { protect, authorizeAdminPosition } = require('../middleware/authMiddleware');

// All routes are protected and require MIS admin position
router.use(protect);
router.use(authorizeAdminPosition('mis'));

// User management routes (MIS admin only)
router.post('/register', registerUser);
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/role/:role', getUsersByRole);

module.exports = router; 