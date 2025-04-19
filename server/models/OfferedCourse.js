import mongoose from "mongoose";

const offeredCourseSchema = new mongoose.Schema({
  edpCode: {
    type: String,
    unique: true,
    required: true,
  },
  courseCode: {
    type: String,
    ref: "Course",
    required: true,
  },
  schedule: {
    day: { type: String, enum: ["M", "T", "W", "Th", "F", "Sat", "Sun"] },
    time: String,
    room: String,
  },
  teacherAssigned: {
    type: String,
    ref: "User.facultyId",
  },
  studentsEnrolled: [
    {
      studentId: { type: String, ref: "User.studentId" },
    },
  ],
});

const OfferedCourse = mongoose.model("OfferedCourse", offeredCourseSchema);

export default OfferedCourse;
