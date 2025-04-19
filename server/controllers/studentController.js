const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student only)
const getStudentProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user || user.role !== 'student') {
            return res.status(404).json({ message: 'Student profile not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student profile (contact info, address, password only)
// @route   PUT /api/students/profile
// @access  Private (Student only)
const updateStudentProfile = async (req, res) => {
    try {
        const { password, contactInformation, address } = req.body;
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'student') {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Only allow updating specific fields
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        if (contactInformation) {
            user.studentInfo.demographicProfile.contactInformation = contactInformation;
        }

        if (address) {
            user.studentInfo.demographicProfile.address = address;
        }

        const updatedUser = await user.save();
        res.json({
            message: 'Profile updated successfully',
            updatedFields: {
                ...(password && { password: 'updated' }),
                ...(contactInformation && { contactInformation: 'updated' }),
                ...(address && { address: 'updated' })
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentProfile,
    updateStudentProfile
}; 