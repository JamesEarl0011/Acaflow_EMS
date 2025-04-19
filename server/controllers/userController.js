const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Register new user (MIS Admin only)
// @route   POST /api/users/register
// @access  Private (Admin only)
const registerUser = async (req, res) => {
    try {
        const { password, role, studentId, facultyId, adminId, studentInfo, teacherInfo, adminInfo } = req.body;

        // Check if user already exists based on role-specific ID
        let existingUser;
        if (role === 'student' && studentId) {
            existingUser = await User.findOne({ studentId });
        } else if (role === 'teacher' && facultyId) {
            existingUser = await User.findOne({ facultyId });
        } else if (role === 'admin' && adminId) {
            existingUser = await User.findOne({ adminId });
        }

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user based on role
        const user = await User.create({
            password: hashedPassword,
            role,
            ...(role === 'student' && { studentId, studentInfo }),
            ...(role === 'teacher' && { facultyId, teacherInfo }),
            ...(role === 'admin' && { adminId, adminInfo })
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                role: user.role,
                ...(role === 'student' && { studentId: user.studentId }),
                ...(role === 'teacher' && { facultyId: user.facultyId }),
                ...(role === 'admin' && { adminId: user.adminId }),
                message: 'User created successfully'
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
    try {
        const { password, role, studentId, facultyId, adminId, studentInfo, teacherInfo, adminInfo, isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user fields
        user.role = role || user.role;
        user.isActive = isActive !== undefined ? isActive : user.isActive;

        // Update role-specific ID and info
        if (role === 'student') {
            if (studentId) user.studentId = studentId;
            if (studentInfo) user.studentInfo = { ...user.studentInfo, ...studentInfo };
        }
        if (role === 'teacher') {
            if (facultyId) user.facultyId = facultyId;
            if (teacherInfo) user.teacherInfo = { ...user.teacherInfo, ...teacherInfo };
        }
        if (role === 'admin') {
            if (adminId) user.adminId = adminId;
            if (adminInfo) user.adminInfo = { ...user.adminInfo, ...adminInfo };
        }

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            role: updatedUser.role,
            ...(updatedUser.role === 'student' && { studentId: updatedUser.studentId }),
            ...(updatedUser.role === 'teacher' && { facultyId: updatedUser.facultyId }),
            ...(updatedUser.role === 'admin' && { adminId: updatedUser.adminId }),
            isActive: updatedUser.isActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Soft delete by setting isActive to false
        user.isActive = false;
        await user.save();

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private (Admin only)
const getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({ role: req.params.role, isActive: true }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUsersByRole
};
