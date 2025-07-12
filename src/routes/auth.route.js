/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 *
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       lastname:
 *         type: string
 *       firstname:
 *         type: string
 *       mail:
 *         type: string
 *       password:
 *         type: string
 *       adress:
 *         type: string
 *       postalCode:
 *         type: string
 *       town:
 *         type: string
 *       phone:
 *         type: string
 *
 *   ErrorResponse:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 *       code:
 *         type: integer
 *
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/User'
 *     responses:
 *       '200':
 *         description: Successful registration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/User'
 *       '400':
 *         description: Bad request or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       '409':
 *         description: Conflict - Email or phone number already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *
 * /auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 code:
 *                   type: integer
 *                 data:
 *                   type: string  # Assuming the token is a string
 *       '400':
 *         description: Bad request or missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       '404':
 *         description: Not Found - User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       '401':
 *         description: Unauthorized - Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */

const express = require("express");
const router = express.Router();
const loginController = require("../controllers/login.controller");
const registerController = require("../controllers/register.controller");
const checkJWT = require("../middlewares/checkJWT");

router.post("/login", loginController.login);
router.post("/register", registerController.register);
router.post("/logout", checkJWT, loginController.logout);

module.exports = router;
