import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  recordId: ObjectId,
  studentId: {
    type: String,
    ref: "User.studentId",
  },
  grades: [
    {
      edpCode: {
        type: String,
        ref: "OfferedCourse",
        required: true,
      },
      midtermGrade: Number,
      finalGrade: Number,
      remarks: String,
    },
  ],
  paymentStatus: {
    midterms: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    finals: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
  },
  accessGranted: {
    midterms: { type: Boolean, default: false },
    finals: { type: Boolean, default: false },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Grade = mongoose.model("Grade", gradeSchema);

export default Grade;
