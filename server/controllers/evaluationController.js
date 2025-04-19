// controllers/evaluationController.js

const Evaluation = require("../models/Evaluation");
const Grade = require("../models/Grade");
const User = require("../models/User");
const Course = require("../models/Course");

// @desc    Automatically update course evaluation when final grade is submitted
// @route   Internal function - called by gradeController
const autoUpdateEvaluation = async (studentId, courseCode, finalGrade) => {
  try {
    // Find or create evaluation record for student
    let evaluation = await Evaluation.findOne({ studentId });

    if (!evaluation) {
      evaluation = new Evaluation({
        studentId,
        courses: [],
      });
    }

    // Check if course already exists in evaluation
    const courseIndex = evaluation.courses.findIndex(
      (course) => course.courseCode === courseCode
    );

    const remarks = finalGrade <= 3.0 ? "Passed" : "Failed"; // 3.0 is equivalent to 75 which is the passing grade

    if (courseIndex === -1) {
      // Add new course evaluation
      evaluation.courses.push({
        courseCode,
        finalGrade,
        remarks,
      });
    } else {
      // Update existing course evaluation
      evaluation.courses[courseIndex] = {
        courseCode,
        finalGrade,
        remarks,
      };
    }

    await evaluation.save();
    return evaluation;
  } catch (error) {
    console.error("Error in autoUpdateEvaluation:", error);
    throw error;
  }
};

// @desc    Manually add/update course evaluation (for transferees/irregular students)
// @route   POST /api/evaluation/manual
// @access  Private (Registrar Admin)
const manualUpdateEvaluation = async (req, res) => {
  try {
    const { studentId, courses } = req.body;

    // Validate student exists
    const student = await User.findOne({ studentId, role: "student" });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate courses exist
    for (const course of courses) {
      const courseExists = await Course.findOne({
        courseCode: course.courseCode,
      });
      if (!courseExists) {
        return res.status(400).json({
          message: `Course ${course.courseCode} does not exist`,
        });
      }
    }

    // Find or create evaluation record
    let evaluation = await Evaluation.findOne({ studentId });

    if (!evaluation) {
      evaluation = new Evaluation({
        studentId,
        courses: [],
      });
    }

    // Update courses
    for (const newCourse of courses) {
      const courseIndex = evaluation.courses.findIndex(
        (course) => course.courseCode === newCourse.courseCode
      );

      const remarks = newCourse.finalGrade >= 75 ? "Passed" : "Failed";

      if (courseIndex === -1) {
        evaluation.courses.push({
          ...newCourse,
          remarks,
        });
      } else {
        evaluation.courses[courseIndex] = {
          ...newCourse,
          remarks,
        };
      }
    }

    await evaluation.save();
    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's course evaluation
// @route   GET /api/evaluation/:studentId
// @access  Private (Student + Registrar Admin)
const getStudentEvaluation = async (req, res) => {
  try {
    const { studentId } = req.params;

    const evaluation = await Evaluation.findOne({ studentId }).populate(
      "courses.courseCode",
      "courseName units prerequisites"
    );

    if (!evaluation) {
      return res.status(404).json({ message: "No evaluation record found" });
    }

    // Calculate additional statistics
    const stats = evaluation.courses.reduce(
      (acc, course) => {
        acc.totalCourses++;
        if (course.remarks === "Passed") {
          acc.passedCourses++;
          acc.totalUnits += course.courseCode.units || 0;
        }
        return acc;
      },
      { totalCourses: 0, passedCourses: 0, totalUnits: 0 }
    );

    res.json({
      evaluation,
      statistics: {
        ...stats,
        completionRate: (
          (stats.passedCourses / stats.totalCourses) *
          100
        ).toFixed(2),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course from evaluation (Registrar only)
// @route   DELETE /api/evaluation/:studentId/course/:courseCode
// @access  Private (Registrar Admin)
const deleteCourseFromEvaluation = async (req, res) => {
  try {
    const { studentId, courseCode } = req.params;

    const evaluation = await Evaluation.findOne({ studentId });
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation record not found" });
    }

    evaluation.courses = evaluation.courses.filter(
      (course) => course.courseCode !== courseCode
    );

    await evaluation.save();
    res.json({ message: "Course removed from evaluation", evaluation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  autoUpdateEvaluation,
  manualUpdateEvaluation,
  getStudentEvaluation,
  deleteCourseFromEvaluation,
};
