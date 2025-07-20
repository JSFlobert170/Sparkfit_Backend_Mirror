const express = require("express");
const router = express.Router();  // Importe les paramètres des parents
const checkJWT = require("../middlewares/checkJWT");
const workoutController = require("../controllers/workout.controller")

router.get("/userWorkouts/", checkJWT, workoutController.getUserWorkouts);
router.get("/",checkJWT, workoutController.getWorkouts);
router.get("/:id", checkJWT, workoutController.getWorkoutById);
router.post("/",checkJWT, workoutController.createWorkout);
router.put("/:id", checkJWT, workoutController.updateWorkout);
router.delete("/:id", checkJWT, workoutController.deleteWorkout);
module.exports = router;
