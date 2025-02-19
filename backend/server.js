const express = require("express");
const cors = require("cors");
const documentRoutes = require("./src/routes/document"); // Ensure the correct path

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/documents", documentRoutes); // 👈 Correct API base path

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

