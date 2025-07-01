const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./utils/swagger');
const dotenv = require("dotenv");
dotenv.config();
const logger = require("./utils/logger");

const app = express();
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

//access to public folder
app.use(express.static(__dirname + "/public"));

// Enable CORS for all routes
app.use(cors());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// initial route
app.get("/", (req, res) => {
    res.send({ message: "Welcome to the application." });
});

// api routes prefix
app.use("/api", routes);

// run server
app.listen(process.env.PORT || 3000, () => {
    // console.log("Starting server...");
    logger.info(`Server is running on http://localhost:${process.env.PORT || 3000}`)
});

module.exports = app;
