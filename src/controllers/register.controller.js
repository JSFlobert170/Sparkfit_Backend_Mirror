const bcrypt = require("bcrypt");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const saltRounds = 10;

async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

exports.register = async (req, res, next) => {
    const { username, email, password, user_type, phone, profile_picture, profile } = req.body;
    let existingUserByPhone = null;
    let existingUserByEmail = null;
    let existingUserName = null;
    


    if (!username || !password || (!email && !phone)) {
        return res.json({
            status: 400,
            message: "Missing required fields",
        });
    }

// Ajouter ici d'autres validations selon les besoins, par exemple :
// - Vérifier le format de l'email
// - Vérifier la complexité du mot de passe
    try {
        if (email) {
            existingUserByEmail = await prisma.user.findUnique({
                where: { email: email },
            });
        }  
        
        if (phone) {
            existingUserByPhone = await prisma.user.findUnique({
                where: { phone: phone },
            });
        }

        existingUserName = await prisma.user.findUnique({
            where: { username: username },
        });
        if (existingUserName) return res.json({status: 409, message: "username already exists"});
        if (existingUserByEmail || existingUserByPhone) {
            return res.json({
                status: 409,
                message: (existingUserByEmail ? "email" : "phone number") + " already exists",
                data: existingUserByEmail ? email : phone,
            });
        }

        const newUser = await prisma.user.create({
            data: {
              username,
              email: email || null,
              password: await hashPassword(password),
              phone: phone || null,
              user_type: user_type || "user",
              profile_picture: profile_picture || null,
              profile: {
                create: profile || {}
              }
            },
            include:{
                profile: true
            }
          });
        return res.json({
            message: "User resgistered successfully",
            status: 201,
            data: newUser,
        });
        // senderEmail(newUser);
    } catch (err) {
        // if (error.code === "P2002") { // Code d'erreur pour la violation de contrainte unique
        //     return res.json({ 
        //       status: 409,
        //       message: "A user with this email already exists." });
        //   }
          return res.json({ 
            status: err.status,
            message: err.message 
        });
    }
};
