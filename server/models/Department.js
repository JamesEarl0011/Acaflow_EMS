import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  departmentId: ObjectId,
  name: String,
  departmentCode: String,
  departmentHead: String,
  programs: [
    {
      programCode: String,
      programName: String,
    },
  ],
});

const Department = mongoose.model("Department", departmentSchema);

export default Department;
