import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  enrollmentId: ObjectId,
  studentId: { type: String, ref: "User.studentId" },
  courses: [
    {
      edpCode: { type: String, ref: "OfferedCourse" },
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
