import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema({
  evaluationId: ObjectId,
  studentId: { type: String, ref: "User.studentId" },
  courses: [
    {
      courseCode: { type: String, ref: "Course" },
      finalGrade: Number,
      remarks: String, //"Passed", "Failed"
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;
