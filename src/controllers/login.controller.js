const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const { userMetrics } = require('../metrics');

// Map pour suivre les sessions actives
const activeSessions = new Map();

exports.login = async (req, res, next) => {
    const { email, password, phone } = req.body;
    if (!password || !(email || phone)) {
        return res.json({
            status: 400,
            message: "Missing email or password",
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.json({
                status: 404,
                message: "User is not found",
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.json({ status: 401, message: "Incorrect password"});
        }

        // Générer le token avec une durée d'expiration
        const token = jwt.sign(
            {
                id: user.user_id,
                admin: user.user_type.toLowerCase() === "admin"? true : false,
                email: user.email,
                // subscriptionStatus: user.subscription || 'free',
            },
            process.env.JWT_SECRET,
            { expiresIn: "365d" }
        );

        // Incrémenter le compteur d'utilisateurs actifs
        if (!activeSessions.has(user.user_id)) {
            activeSessions.set(user.user_id, true);
            userMetrics.activeUsers.inc();
        }

        return res.json({
            status: 200,
            message: "Login successful",
            token: token,
        });
    } catch (err) {
        logger.error(err);
        return res.json({ status: err.status, message: err.message});
    }
};

// Fonction de déconnexion
exports.logout = async (req, res) => {
    try {
        const userId = req.userToken.id;
        
        // Décrémenter le compteur d'utilisateurs actifs
        if (activeSessions.has(userId)) {
            activeSessions.delete(userId);
            userMetrics.activeUsers.dec();
        }

        return res.json({
            status: 200,
            message: "Logout successful"
        });
    } catch (err) {
        logger.error(err);
        return res.json({ 
            status: 500, 
            message: "Error during logout" 
        });
    }
};

// Nettoyage périodique des sessions expirées (toutes les 5 minutes)
setInterval(() => {
    const now = Date.now();
    activeSessions.forEach((timestamp, userId) => {
        if (now - timestamp > 24 * 60 * 60 * 1000) { // 24 heures
            activeSessions.delete(userId);
            userMetrics.activeUsers.dec();
        }
    });
}, 5 * 60 * 1000);
