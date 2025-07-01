const express = require("express");
const router = express.Router();
const checkJWT = require("../middlewares/checkJWT");
const userController = require("../controllers/user.controller");
// const profileController = require("../controllers/profile.controller");
// const userProfileRoute = require("./profile.route");


router.get("/", checkJWT, userController.getAllUsers);
router.get("/:id", checkJWT, userController.getUser);
router.put("/:id", checkJWT, userController.updateUser);
router.delete("/:id", checkJWT, userController.deleteUser);
router.get("/self/me", checkJWT, userController.getMe);

// router.use("/:id/profile", userProfileRoute);

// router.get("/profiles", checkJWT, profileController.getUsersProfile);
// router.post("/:id/profile",checkJWT, profileController.addProfile);

// router.get("/:id/profile",checkJWT, profileController.getUserProfile);
// router.put("/:id/profile", checkJWT, profileController.updateUserProfile);
// router.delete("/:id/profile", checkJWT, profileController.deleteUserProfile);


module.exports = router;

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       204:
 *         description: Supprimé avec succès
 *       401:
 *         description: Non autorisé
 */

/**
 * @swagger
 * /users/self/me:
 *   get:
 *     summary: Récupérer les infos de l’utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Infos utilisateur
 *       401:
 *         description: Non autorisé
 */

module.exports = router;
