const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

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
            return res.json({ status: 401,message: "Incorrect password"});
        }
        const token = jwt.sign(
            {
                id: user.user_id,
                admin: user.user_type.toLowerCase() === "admin"? true : false,
            },
            process.env.JWT_SECRET,
            { expiresIn: "365d" }
        );
        console.log(token);

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
