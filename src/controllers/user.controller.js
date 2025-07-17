const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllUsers = async (req, res, next) => {
  if (!req.userToken.admin) {
    return res.status(401).json({
        status: 401,
        message: "Admin access required",
    });
  }
  try {
    const allUsers = await prisma.user.findMany({
      include: {
        profile: true,
        workouts: true,
      }
      
    })
    if (!allUsers) {
        return res.status(404).json({
          status: 404,
          message: "Users not found",
        });
    }
    return res.status(200).json({
        status: 200,
        message: "Successfully retrieved all users",
        data: allUsers
    });
} catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message || "Bad request",
    });
}
}

exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userTokenId = req.userToken.id;
    if (!id || !userTokenId) {
      return res.status(400).json({
        status: 400,
        message: "Id is required",
      });
    }
  if (id != req.userToken.id && req.userToken.admin != true) {
    return res.status(401).json({
        status: 401,
        message: "Unauthorized",
    });
  }
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        profile: true,
        workouts: true,
      }
    });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
  }
      return res.status(200).json({
        status: 200,  
        message: "Successfully retrieved user",
        data: user
      });

  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message || "Bad request",
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userTokenId = req.userToken.id;
    const { username, email, profile_picture, password, phone, profile, workouts } = req.body;
    let existingUserByPhone = null;
    let existingUserByEmail = null;
    let existingUserName = null;
    console.log(req.body)
    console.log(req.userToken)

    if (!id || !userTokenId || !req.body) {
      return res.status(400).json({
        status: 400,
        message: "Id is required",
      });
    }

    if (id != req.userToken.id && req.userToken.admin != true) {
      return res.status(401).json({
          status: 401,
          message: "Unauthorized",
      });
    }
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
    if (existingUserName && id != req.userToken.id) return res.status(409).json({status: 409, message: "username already exists"});
    if ((existingUserByEmail || existingUserByPhone) && id != req.userToken.id) {
      return res.status(409).json({
          status: 409,
          message: (existingUserByEmail ? "email" : "phone number") + " already exists",
          data: existingUserByEmail ? email : phone,
      });
    }

      // Préparer l'objet data pour la mise à jour
    const updateData = {
      username,
      email,
      profile_picture,
      password
    };

    // Ajouter conditionnellement la mise à jour du profil
    if (profile) {
      updateData.profile = {
        update: {
          ...profile
        }
      };
    }

    // Ajouter conditionnellement la mise à jour des workouts
    if (workouts) {
      updateData.workouts = {
        update: {
          ...workouts
        }
      };
    }
    
      const updatedUser = await prisma.user.update({
        where: { user_id: parseInt(id) },
        data: updateData,
        include: {
          profile: true,
          workouts: true,
        }
      });
      if (!updatedUser) {
        return res.status(404).json({
          status: 404,
          message: "User is not found",
        });
      }
      return res.status(200).json({
        status: 200,
        message: "Successfully updated user",
        data: updatedUser
      });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message || "Bad request",
    });
  }
};
  
exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  const userTokenId = req.userToken.id;
    if (!id || !userTokenId) {
      return res.status(400).json({
        status: 400,
        message: "Id is required",
      });
    }
    if (id != req.userToken.id && req.userToken.admin != true) {
      return res.status(401).json({
          status: 401,
          message: "Unauthorized",
      });
    }
    try {
      // Vérifier si l'utilisateur existe
      const user = await prisma.user.findUnique({
        where: { user_id: parseInt(id) }
      });

      if (!user) {
        return res.status(404).json({
          status: 404,
          message: "User not found",
        });
      }

      // Supprimer les workouts
      await prisma.workout.deleteMany({
        where: { user_id: parseInt(id) }
      });

      // Supprimer le profil s'il existe
      const profile = await prisma.profile.findFirst({
        where: { user_id: parseInt(id) }
      });
      if (profile) {
        await prisma.profile.delete({
          where: { user_id: parseInt(id) }
        });
      }

      // Supprimer l'utilisateur
      await prisma.user.delete({
        where: { user_id: parseInt(id) }
      });

      return res.status(204).send();
  } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message || "Bad request",
      });
  }
};

exports.getMe = async (req, res, next) => {
  try {
      const id = req.userToken.id;
      if (!id) {
          return res.status(400).json({
            status: 400,
            message: "Id is required",
          });
      }
      console.log(id)
      const user = await prisma.user.findUnique({
        where: { user_id: parseInt(id) },
        include: {
          profile: true,
          //workouts: true,
        } 
      });
      if (!user) {
          return res.status(404).json({
            status: 404,
            message: "User is not found",
          });
      }
      return res.status(200).json({
        status: 200,
        message: "Successfully retrieved user",
        data: user
      });
  } catch (err) {
      return res.status(500).json({
        status: 500,
        message: err.message || "Bad request",
      });
  }
};