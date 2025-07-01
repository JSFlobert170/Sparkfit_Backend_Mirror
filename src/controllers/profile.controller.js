const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const id = userId;
    const userTokenId = req.userToken.id;
    if (!id || !userTokenId) {
      return res.json({
        status: 400,
        message: "Id is required",
      });
    }
  if (id != req.userToken.id && req.userToken.admin != true) {
    return res.json({
        status: 401,
        message: "Unauthorized",
    });
  }
    const userProfile = await prisma.profile.findUnique({
      where: { user_id: parseInt(id) },
    });
    if (!userProfile) {
      return res.json({
        status: 404,
        message: "User profile not found",
      });
  }
      return res.json({
        status  : 200,  
        message : "Successfully retrieved user profile",
        data : userProfile
      });

  } catch (err) {
    return res.json({
      status: err.status,
      message: err.message || "Bad request",
    });
  }
};

exports.updateUserProfile = async (req, res, next) => {
  const { userId } = req.params;
  const id = userId;
  const userTokenId = req.userToken.id;
  const { age, weight, height, fitness_goal, goal_detail, intensity } = req.body;
  try {
    if (!id || !userTokenId || !req.body) {
      return res.json({
        status: 400,
        message: "Id is required",
      });
    }
    if (id != req.userToken.id && req.userToken.admin != true) {
      return res.json({
          status: 401,
          message: "Unauthorized",
      });
    }
      const updatedUserProfile = await prisma.profile.update({
        where: { user_id: parseInt(id) },
        data: { age, weight, height, fitness_goal, goal_detail, intensity },
      });
      if (!updatedUserProfile) {
        return res.json({
          status: 404,
          message: "User profile is not found",
        });
      }
      return res.json({
        status  : 200,
        message : "Successfully updated user profile",
        data : updatedUserProfile
      });
  } catch (err) {
    return res.json({
      status: err.status,
      message: err.message || "Bad request",
    });
  }
};

exports.deleteUserProfile = async (req, res, next) => {
  const { userId } = req.params;
  const id = userId;
  const userTokenId = req.userToken.id;
  if (!id || !userTokenId) {
    return res.json({
      status: 400,
      message: "Id is required",
    });
  }
  if (id != req.userToken.id && req.userToken.admin != true) {
    return res.json({
        status: 401,
        message: "Unauthorized",
    });
  }
    try {
      const deletedUserProfile = await prisma.profile.delete({
        where: { user_id: parseInt(id) },
      });
      if (!deletedUserProfile) {
        return res.json({
          status: 404,
          message: "User profile not found or already deleted",
        });
    }
      return res.json({
        status  : 204,
        message : "Successfully deleted user profile",
        data : deletedUserProfile
      });
  } catch (err) {
    return res.json({
      status: err.status,
      message: err.message || "Bad request",
    });
  }
};


// a reflechir pas encore utiliser
// exports.getUsersProfile = async (req, res, next) => {
//   console.log(req.userToken)
//   if (!req.userToken.admin) {
//     return res.json({
//         status: 401,
//         message: "Admin access required",
//     });
//   }
//   try {
//     const allUsersProfile = await prisma.profile.findMany();
//     if (!allUsersProfile) {
//         return res.json({
//           status: 404,
//           message: "Users profile not found",
//         });
//     }
//     return res.json({
//         status: 200,
//         message: "Successfully retrieved all users profile",
//         data: allUsersProfile,
//     });
// } catch (err) {
//     return res.json({
//       status: err.status,
//       message: err.message || "Bad request",
//     });
// }
// }

// exports.addProfile = async (req, res, next) => {
//   const { userId } = req.params;
//   const { age, weight, height, fitness_goal, goal_detail } = req.body;

//   if(!age || !weight || !height || !fitness_goal || !goal_detail){
//     return res.json({ 
//       status: 400,
//       message: "Please provide all the required fields" });
//   }

//   try {
//     // Check if the user exists
//     const userExists = await prisma.user.findUnique({
//       where: { user_id: parseInt(userId) }
//     });

//     if (!userExists) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Create profile
//     const addProfile = await prisma.profile.create({
//       data: {
//         user_id: parseInt(userId),
//         age,
//         weight,
//         height,
//         fitness_goal,
//         goal_detail
//       }
//     });

//     res.json({
//       status: 201,
//       message: "Profile created successfully",
//       data: addProfile
//   });
//   } catch (error) {
//     res.status(500).json({ 
//       status: error.status || 500,
//       message: error.message || "Failed to create profile",
//      });
//   }
// };

// exports.getMeProfile = async (req, res, next) => {
//   try {
//       const id = req.userToken.id;
//       if (!id) {
//           return res.json({
//             status: 400,
//             message: "Id is required",
//           });
//       }
//       const userProfile = await prisma.profile.findUnique({
//         where: { user_id: parseInt(id) },
//       });
//       if (!userProfile) {
//           return res.json({
//             status: 404,
//             message: "User is not found",
//           });
//       }

//       return res.json({
//         status: 200,
//         message: "Successfully retrieved user",
//         data: userProfile,
//       });
//   } catch (err) {
//     return res.json({
//       status: err.status,
//       message: err.message || "Bad request",
//     });
//   }
// };