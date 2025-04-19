import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseDescription: { type: String, required: true },
  creditUnits: { type: Number, required: true },
  coursePrerequisites: [String],
  department: { type: String, ref: "Department" },
  programCode: { type: String, ref: "Department.programs" },
  yearOffered: Number,
  semesterOffered: Number,
  curriculumYear: Number,
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
