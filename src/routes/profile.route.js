const express = require("express");
const router = express.Router({ mergeParams: true });  // Importe les paramètres des parents
const checkJWT = require("../middlewares/checkJWT");
const profileController = require("../controllers/profile.controller");

// router.get("/profiles", checkJWT, profileController.getUsersProfile);
// router.post("/:id/profile",checkJWT, profileController.addProfile);
// router.delete("/", checkJWT, profileController.deleteUserProfile);

router.get("/:userId/profile/",checkJWT, profileController.getUserProfile);
router.put("/:userId/profile/", checkJWT, profileController.updateUserProfile);

module.exports = router;

/**
 * @swagger
 * /users/{userId}/profile:
 *   get:
 *     summary: Récupérer le profil d’un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l’utilisateur
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré
 *       401:
 *         description: Non autorisé ou token invalide
 *       404:
 *         description: Profil non trouvé
 */

/**
 * @swagger
 * /users/{userId}/profile:
 *   put:
 *     summary: Mettre à jour le profil d’un utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l’utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 example: "Passionné par la tech et la danse"
 *               avatar:
 *                 type: string
 *                 example: "https://exemple.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non autorisé
 */

module.exports = router;
