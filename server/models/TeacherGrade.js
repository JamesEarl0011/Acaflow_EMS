import mongoose from "mongoose";

const teacherGradeSchema = new mongoose.Schema({
  teacher: {
    type: String,
    ref: "User.facultyId",
    required: true,
  },
  edpCode: {
    type: String,
    ref: "OfferedCourse",
    required: true,
  },
  term: { type: String, enum: ["Midterms", "Finals"] },
  grades: [
    {
      studentId: { type: String, ref: "User.studentId" },
      grade: Number,
      remarks: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TeacherGrade = mongoose.model("TeacherGrade", teacherGradeSchema);

export default TeacherGrade;
