const Clearance = require('../models/Clearance');
const OfferedCourse = require('../models/OfferedCourse');
const Enrollment = require('../models/Enrollment');

// Get clearances for a teacher's courses
const getTeacherClearances = async (req, res) => {
    try {
        const teacherId = req.user.facultyId;

        // Get all courses assigned to the teacher
        const courses = await OfferedCourse.find({ teacherAssigned: teacherId });

        // Get clearances for these courses
        const clearances = await Clearance.find({
            'clearances.courseCode': { $in: courses.map(c => c.courseCode) }
        }).populate('studentId', 'name studentId');

        res.json(clearances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update student clearance status
const updateClearanceStatus = async (req, res) => {
    try {
        const { studentId, courseCode } = req.params;
        const { status, remarks } = req.body;

        // Validate status
        if (!['Pending', 'Cleared', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Check if teacher is assigned to this course
        const course = await OfferedCourse.findOne({
            courseCode,
            teacherAssigned: req.user.facultyId
        });

        if (!course) {
            return res.status(403).json({ message: 'Not authorized to update this clearance' });
        }

        // Find or create clearance record
        let clearance = await Clearance.findOne({ studentId });
        if (!clearance) {
            clearance = new Clearance({ studentId, clearances: [] });
        }

        // Update or add clearance record
        const clearanceIndex = clearance.clearances.findIndex(
            c => c.courseCode === courseCode
        );

        if (clearanceIndex >= 0) {
            clearance.clearances[clearanceIndex] = {
                courseCode,
                teacherId: req.user.facultyId,
                status,
                remarks
            };
        } else {
            clearance.clearances.push({
                courseCode,
                teacherId: req.user.facultyId,
                status,
                remarks
            });
        }

        await clearance.save();

        // If all clearances are cleared, update enrollment status
        if (status === 'Cleared') {
            const allCleared = clearance.clearances.every(c => c.status === 'Cleared');
            if (allCleared) {
                await Enrollment.findOneAndUpdate(
                    { studentId },
                    { status: 'Cleared' }
                );
            }
        }

        res.json({
            message: 'Clearance status updated successfully',
            clearance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get student's clearance status
const getStudentClearance = async (req, res) => {
    try {
        const studentId = req.user.studentId;
        const clearance = await Clearance.findOne({ studentId })
            .populate('clearances.courseCode', 'courseCode courseDescription');

        if (!clearance) {
            return res.json({
                message: 'No clearance records found',
                clearances: []
            });
        }

        res.json(clearance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTeacherClearances,
    updateClearanceStatus,
    getStudentClearance
}; 