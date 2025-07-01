const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route")
const userRoute = require("./user.route");
const userProfileRoute = require("./profile.route");
const workoutRoute = require("./workout.route");


router.use(express.json());
router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use('/user', userProfileRoute);

router.use('/user', workoutRoute);
router.use('/workouts', workoutRoute);

module.exports = router;