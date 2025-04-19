import mongoose from "mongoose";

const clearanceSchema = new mongoose.Schema({
  clearanceId: ObjectId,
  studentId: { type: String, ref: "User.studentId", required: true },
  clearances: [
    {
      courseCode: { type: String, ref: "OfferedCourse" },
      teacherId: { type: String, ref: "User.facultyId" },
      status: {
        type: String,
        enum: ["Pending", "Cleared", "Rejected"],
        default: "Pending",
      },
      remarks: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Clearance = mongoose.model("Clearance", clearanceSchema);

export default Clearance;
