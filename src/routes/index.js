const express = require("express");
const router = express.Router();
const { register } = require('../metrics');

const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const userProfileRoute = require("./profile.route");
const workoutRoute = require("./workout.route");

router.use(express.json());
router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use('/user', userProfileRoute);
router.use('/workouts', workoutRoute);

// Endpoint pour les métriques Prometheus
router.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

module.exports = router;