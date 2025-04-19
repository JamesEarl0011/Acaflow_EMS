import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
