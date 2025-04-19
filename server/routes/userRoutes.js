import express from "express";
import { registerUser, authUser } from "../controllers/userController.js";
import { protect, admin, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);

// Example of protected route
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome to the ${req.user.role} dashboard` });
});

export default router;
