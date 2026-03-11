const express = require("express");
const router = express.Router();
const { logExercise, getAllExercises, getTodayExercises, deleteExercise, updateExercise } = require("../controllers/exerciseController");
const authenticate = require("../middlewares/Authenticate");

router.post("/log", authenticate, logExercise);
router.get("/all", authenticate, getAllExercises);
router.get("/today", authenticate, getTodayExercises);
router.delete("/log/:id", authenticate, deleteExercise);
router.put("/log/:id", authenticate, updateExercise);

module.exports = router;