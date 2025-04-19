import express from "express";
import { registerUser, authUser, getUsers, getUser, updateUser, deleteUser, getUsersByRole } from "../controllers/userController.js";
import { protect, admin, roleCheck, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);

// Example of protected route
router.get("/dashboard", protect, (req, res) => {
  res.json({ message: `Welcome to the ${req.user.role} dashboard` });
});

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/role/:role', getUsersByRole);

export default router;
