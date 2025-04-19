const Grade = require('../models/Grade');
const User = require('../models/User');
const TeacherGrade = require('../models/TeacherGrade');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv') {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

// Update payment status and grade access (Accounting Admin only)
const updatePaymentStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { term, status } = req.body;

        // Validate term
        if (!['midterms', 'finals'].includes(term)) {
            return res.status(400).json({ message: 'Invalid term. Must be either "midterms" or "finals"' });
        }

        // Validate status
        if (!['Pending', 'Paid'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be either "Pending" or "Paid"' });
        }

        // Find the grade record
        let grade = await Grade.findOne({ studentId });
        if (!grade) {
            grade = new Grade({ studentId });
        }

        // Special check for finals payment
        if (term === 'finals' && status === 'Paid' && grade.paymentStatus.midterms !== 'Paid') {
            return res.status(400).json({ 
                message: 'Cannot update finals payment status to "Paid" if midterms payment is still "Pending"' 
            });
        }

        // Update payment status
        grade.paymentStatus[term] = status;
        
        // Update access granted based on payment status
        grade.accessGranted[term] = status === 'Paid';

        await grade.save();

        res.json({ 
            message: `Payment status for ${term} updated successfully`,
            grade 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload grades for a single student (Teacher only)
const uploadStudentGrade = async (req, res) => {
    try {
        const { edpCode, studentId, grade, term } = req.body;

        // Validate term
        if (!['Midterms', 'Finals'].includes(term)) {
            return res.status(400).json({ message: 'Invalid term. Must be either "Midterms" or "Finals"' });
        }

        // Create or update teacher grade record
        let teacherGrade = await TeacherGrade.findOne({ 
            teacher: req.user.facultyId,
            edpCode,
            term
        });

        if (!teacherGrade) {
            teacherGrade = new TeacherGrade({
                teacher: req.user.facultyId,
                edpCode,
                term,
                grades: []
            });
        }

        // Update or add student grade
        const existingGradeIndex = teacherGrade.grades.findIndex(
            g => g.studentId === studentId
        );

        if (existingGradeIndex >= 0) {
            teacherGrade.grades[existingGradeIndex].grade = grade;
        } else {
            teacherGrade.grades.push({ studentId, grade });
        }

        await teacherGrade.save();

        res.json({ 
            message: 'Grade uploaded successfully',
            teacherGrade 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get grades for a student (Student only)
const getStudentGrades = async (req, res) => {
    try {
        const studentId = req.user.studentId;
        
        // Get payment status and access granted
        const grade = await Grade.findOne({ studentId });
        if (!grade) {
            return res.json({ 
                message: 'No grades available',
                grades: [],
                access: { midterms: false, finals: false }
            });
        }

        // Get all teacher grades for this student
        const teacherGrades = await TeacherGrade.find({
            'grades.studentId': studentId
        });

        // Filter grades based on access granted
        const filteredGrades = teacherGrades.map(tg => {
            const studentGrade = tg.grades.find(g => g.studentId === studentId);
            return {
                edpCode: tg.edpCode,
                term: tg.term,
                grade: studentGrade.grade,
                accessGranted: grade.accessGranted[tg.term.toLowerCase()]
            };
        });

        res.json({
            grades: filteredGrades,
            access: grade.accessGranted
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload grades via CSV file (Teacher only)
const uploadGradesFromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { term } = req.body;
        const teacherId = req.user.facultyId;
        const results = [];
        const errors = [];

        // Validate term
        if (!['Midterms', 'Finals'].includes(term)) {
            return res.status(400).json({ message: 'Invalid term. Must be either "Midterms" or "Finals"' });
        }

        // Process CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', async () => {
                try {
                    // Process each row
                    for (const row of results) {
                        try {
                            const { edpCode, studentId, grade } = row;

                            // Validate required fields
                            if (!edpCode || !studentId || !grade) {
                                errors.push({ row, error: 'Missing required fields' });
                                continue;
                            }

                            // Create or update teacher grade record
                            let teacherGrade = await TeacherGrade.findOne({ 
                                teacher: teacherId,
                                edpCode,
                                term
                            });

                            if (!teacherGrade) {
                                teacherGrade = new TeacherGrade({
                                    teacher: teacherId,
                                    edpCode,
                                    term,
                                    grades: []
                                });
                            }

                            // Update or add student grade
                            const existingGradeIndex = teacherGrade.grades.findIndex(
                                g => g.studentId === studentId
                            );

                            if (existingGradeIndex >= 0) {
                                teacherGrade.grades[existingGradeIndex].grade = grade;
                            } else {
                                teacherGrade.grades.push({ studentId, grade });
                            }

                            await teacherGrade.save();
                        } catch (error) {
                            errors.push({ row, error: error.message });
                        }
                    }

                    // Clean up uploaded file
                    fs.unlinkSync(req.file.path);

                    res.json({ 
                        message: 'Grades processed successfully',
                        totalProcessed: results.length,
                        errors: errors
                    });
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updatePaymentStatus,
    uploadStudentGrade,
    getStudentGrades,
    uploadGradesFromFile,
    upload // Export multer upload middleware
}; 