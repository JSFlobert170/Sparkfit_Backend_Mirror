const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// exports.createWorkout = async (req, res, next) => {
//     const { date, duration, calories_burned, details, exercise } = req.body;
//     try {
//         const newWorkout = await prisma.workout.create({
//             data: {
//                 user_id: req.userToken.admin? undefined : parseInt(req.userToken.id),
//                 date,
//                 duration,
//                 calories_burned,
//                 // details: {
//                 //     create: details || {}
//                 // },
//                 // details: {
//                 //     create: exercise || {}// `exercises` should be an array of objects containing exercise details
//                 // },
//                 details: {
//                     create: exercise?.map(ex => ({
//                         sets: ex.sets,
//                         reps: ex.reps,
//                         weight: ex.weight,
//                         exercise: {
//                             create: {
//                                 name: ex.name,
//                                 description: ex.description,
//                                 video_url: ex.video_url,
//                                 goal_type: ex.goal_type
//                             }
//                         }
//                     }))
//                 }
//             },
//             include: {
//                 // details: true,
//                 details: {
//                     include: {
//                         exercise: true,
//                     }
//                 },
//                 // exercise: true,
//                 user: true
//             }
//         });
//         return res.json({
//             status: 201,
//             message: "Workout created successfully",
//             data: newWorkout,
//         });

//     } catch (err) {
//         return res.json({
//             status: err.status,
//             message: err.message || "Bad request",
//         });
//     }
// };

// exports.createWorkout = async (req, res, next) => {
//     console.log(req.userToken)
//     const { date, duration, calories_burned, exercise } = req.body;
//     console.log(exercise)
//     try {
//         // Gestion de l'utilisateur
//         // if (req.userToken.admin) {
//         //     return res.status(403).json({ status: 403, message: "Admins cannot create workouts" });
//         // }
//         const userId = parseInt(req.userToken.id);

//         // Mapping des détails pour Prisma
//         const detailsData = exercise?.map(ex => ({
//             sets: ex.sets,
//             reps: ex.reps,
//             weight: ex.weight,
//             exercise: {
//                 // connectOrCreate cherche un exercise par son nom+goal_type, sinon le crée
//                 connectOrCreate: {
//                     where: {
//                         name_goal_type: {
//                             name: ex.name,
//                             goal_type: ex.goal_type
//                         }
//                     },
//                     create: {
//                         name: ex.name,
//                         description: ex.description,
//                         video_url: ex.video_url,
//                         goal_type: ex.goal_type
//                     }
//                 }
//             }
//         })) || [];

//         const newWorkout = await prisma.workout.create({
//             data: {
//                 user_id: userId,
//                 date,
//                 duration,
//                 calories_burned,
//                 details: {
//                     create: detailsData
//                 }
//             },
//             include: {
//                 details: {
//                     include: {
//                         exercise: true
//                     }
//                 },
//                 user: true
//             }
//         });

//         return res.status(201).json({
//             status: 201,
//             message: "Workout created successfully",
//             data: newWorkout,
//         });

//     } catch (err) {
//         return res.status(500).json({
//             status: 500,
//             message: err.message || "Bad request",
//         });
//     }
// };

// exports.createWorkout = async (req, res, next) => {
//     const { date, duration, calories_burned, details, exercise } = req.body;
//     const userId = parseInt(req.userToken.id);
//     console.log(req.body)
//     res.send("ok")



//     try {


//         // // 1. Recherche d'un Workout existant pour l'utilisateur et la date
//         // const existingWorkout = await prisma.workout.findFirst({
//         //     where: {
//         //         user_id: userId,
//         //         date: new Date(date)
//         //     },
//         //     include: {
//         //         details: {
//         //           include: {
//         //             exercise: true
//         //           }
//         //         },
//         //         user: true
//         //       }
//         // });

//         // // Préparation de la liste des exercices déjà dans le workout (name + goal_type)
//         // let existingExercisesSet = new Set();
//         // if (existingWorkout) {
//         //     for (const detail of existingWorkout.details) {
//         //         if (detail.exercise)
//         //             existingExercisesSet.add(detail.exercise.name + '|' + detail.exercise.goal_type);
//         //     }
//         // }

//         // // On ne garde QUE les exercices du payload qui ne sont pas déjà présents
//         // const filteredExercises = exercise?.filter(ex =>
//         //     !existingExercisesSet.has(ex.name + '|' + ex.goal_type)
//         // ) || [];

//         // if (existingWorkout) {
//         //     // Si aucun nouveau, on répond simplement avec le workout existant
//         //     if (filteredExercises.length === 0) {
//         //         return res.status(200).json({
//         //             status: 200,
//         //             message: "All these exercises already exist in this workout/date.",
//         //             data: existingWorkout,
//         //         });
//         //     }

//         //     // Sinon, on ajoute UNIQUEMENT les nouveaux exercices
//         //     for (const ex of filteredExercises) {
//         //         // upsert pour l'exercice (évite les doublons)
//         //         const exerciseObj = await prisma.exercise.upsert({
//         //             where: {
//         //                 name_goal_type: {
//         //                     name: ex.name,
//         //                     goal_type: ex.goal_type
//         //                 }
//         //             },
//         //             update: {},
//         //             create: {
//         //                 name: ex.name,
//         //                 description: ex.description,
//         //                 video_url: ex.video_url,
//         //                 goal_type: ex.goal_type
//         //             }
//         //         });

//         //         // Ajout du Workout_Detail
//         //         await prisma.workout_Detail.create({
//         //             data: {
//         //                 workout_id: existingWorkout.workout_id,
//         //                 exercise_id: exerciseObj.exercise_id,
//         //                 sets: ex.sets,
//         //                 reps: ex.reps,
//         //                 weight: ex.weight
//         //             }
//         //         });
//         //     }

//         //     // Recharger le workout mis à jour
//         //     const resultWorkout = await prisma.workout.findUnique({
//         //         where: { workout_id: existingWorkout.workout_id },
//         //         include: {
//         //             details: {
//         //               include: {
//         //                 exercise: true
//         //               }
//         //             },
//         //             user: true
//         //           }
//         //     });

//         //     return res.status(200).json({
//         //         status: 200,
//         //         message: "Workout updated (only new exercises were added).",
//         //         data: resultWorkout,
//         //     });

//         // } else {
//         //     // Nouveau workout, tout le payload est OK
//         //     const detailsData = filteredExercises.map(ex => ({
//         //         sets: ex.sets,
//         //         reps: ex.reps,
//         //         weight: ex.weight,
//         //         exercise: {
//         //             connectOrCreate: {
//         //                 where: {
//         //                     name_goal_type: {
//         //                         name: ex.name,
//         //                         goal_type: ex.goal_type
//         //                     }
//         //                 },
//         //                 create: {
//         //                     name: ex.name,
//         //                     description: ex.description,
//         //                     video_url: ex.video_url,
//         //                     goal_type: ex.goal_type
//         //                 }
//         //             }
//         //         }
//         //     }));

//         //     const newWorkout = await prisma.workout.create({
//         //         data: {
//         //             user_id: userId,
//         //             date,
//         //             duration,
//         //             calories_burned,
//         //             details: {
//         //                 create: detailsData
//         //             }
//         //         },
//         //         include: {
//         //             details: {
//         //               include: {
//         //                 exercise: true
//         //               }
//         //             },
//         //             user: true
//         //         }
//         //     });

//         //     return res.status(201).json({
//         //         status: 201,
//         //         message: "Workout created successfully",
//         //         data: newWorkout,
//         //     });
//         // }

//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({
//             status: 500,
//             message: err.message || "Bad request",
//         });
//     }
// };


exports.createWorkout = async (req, res) => {
  const userId = parseInt(req.userToken.id);
  const plan = req.body.plan;

  if (!Array.isArray(plan) || plan.length === 0) {
    return res.status(400).json({ status: 400, message: "Le champ 'plan' doit être un tableau non vide." });
  }

  try {
    const createdWorkouts = [];

    for (const workout of plan) {
      const { date, duration, calories_burned, details } = workout;

      // Préparation des détails
      const detailsData = details.map(detail => ({
        sets: detail.sets,
        reps: detail.reps,
        weight: detail.weight,
        exercise: {
          connectOrCreate: {
            where: {
              name_goal_type: {
                name: detail.exercise.name,
                goal_type: detail.exercise.goal_type
              }
            },
            create: {
              name: detail.exercise.name,
              description: detail.exercise.description,
              video_url: detail.exercise.video_url || null,
              goal_type: detail.exercise.goal_type
            }
          }
        }
      }));

      const newWorkout = await prisma.workout.create({
        data: {
          user_id: userId,
          date: new Date(date),
          duration,
          calories_burned,
          details: {
            create: detailsData
          }
        },
        include: {
          details: { include: { exercise: true } }
        }
      });

      createdWorkouts.push(newWorkout);
    }

    return res.status(201).json({
      status: 201,
      message: "Plan d'entraînement créé avec succès.",
      data: createdWorkouts
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: err.message || "Erreur serveur lors de la création du plan d'entraînement"
    });
  }
};




exports.getWorkouts = async (req, res, next) => {
    if (!req.userToken.admin) {
        return res.json({
          status: 400,
          message: "Only admin can access",
        });
      }
    try {
        const workouts = await prisma.workout.findMany({
            include: {
                details: {
                  include: {
                    exercise: true
                  }
                },
                user: true
            }
        });
        if (!workouts) {
            return res.json({
              status: 404,
              message: "Workouts not found",
            });
        }
        return res.json({
            status: 200,
            message: "Successfully retrieved all workouts",
            data: workouts
        });
    } catch (err) {
        return res.json({
            status: err.status,
            message: err.message || "Bad request",
        });
    }
};

exports.getWorkoutById = async (req, res, next) => {
    try {
        const { id } = req.params;
    if (!id) {
      return res.json({
        status: 400,
        message: "Id is required",
      });
    }
    const workout = await prisma.workout.findUnique({
      where: { workout_id: parseInt(id) },
      include: {
        details: {
          include: {
            exercise: true
          }
        },
        // user: true
        }
    });
    if (!workout) {
      return res.json({
        status: 404,
        message: "Workout not found",
      });
  }
      return res.json({
        status  : 200,  
        message : "Successfully retrieved Workout",
        data : workout
      });

    } catch (err) {
        return res.json({
            status: err.status,
            message: err.message || "Bad request",
        });
    }
};

exports.updateWorkout = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = parseInt(req.userToken.id);
        const { date, duration, calories_burned, details } = req.body;

        if (!id) {
            return res.json({
                status: 400,
                message: "Workout ID is required",
            });
        }

        // Vérifier que le workout appartient à l'utilisateur
        const existingWorkout = await prisma.workout.findUnique({
            where: { workout_id: parseInt(id) },
            include: { details: true }
        });

        if (!existingWorkout) {
            return res.json({
                status: 404,
                message: "Workout not found",
            });
        }

        if (existingWorkout.user_id !== userId && !req.userToken.admin) {
            return res.json({
                status: 401,
                message: "Unauthorized to update this workout",
            });
        }

        // Supprimer les anciens détails
        await prisma.workout_Detail.deleteMany({
            where: { workout_id: parseInt(id) }
        });

        // Préparer les nouveaux détails si fournis
        let detailsData = [];
        if (details && Array.isArray(details)) {
            detailsData = details.map(detail => ({
                workout_id: parseInt(id),
                exercise_id: detail.exercise_id,
                sets: detail.sets,
                reps: detail.reps,
                weight: detail.weight
            }));
        }

        // Mettre à jour le workout
        const updateData = {};
        if (date) updateData.date = new Date(date);
        if (duration) updateData.duration = duration;
        if (calories_burned) updateData.calories_burned = calories_burned;

        const updatedWorkout = await prisma.workout.update({
            where: { workout_id: parseInt(id) },
            data: updateData,
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });

        // Créer les nouveaux détails
        if (detailsData.length > 0) {
            await prisma.workout_Detail.createMany({
                data: detailsData
            });
        }

        // Récupérer le workout final avec tous les détails
        const finalWorkout = await prisma.workout.findUnique({
            where: { workout_id: parseInt(id) },
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });

        return res.json({
            status: 200,
            message: "Successfully updated workout",
            data: finalWorkout
        });

    } catch (err) {
        console.error('Update workout error:', err);
        return res.json({
            status: 500,
            message: err.message || "Internal server error",
        });
    }
};

exports.deleteWorkout = async (req, res, next) => {
    const { id } = req.params;
    const userId = parseInt(req.userToken.id);
    
    if (!id) {
        return res.json({
            status: 400,
            message: "Workout ID is required",
        });
    }

    try {
        // Vérifier que le workout existe et appartient à l'utilisateur
        const existingWorkout = await prisma.workout.findUnique({
            where: { workout_id: parseInt(id) }
        });

        if (!existingWorkout) {
            return res.json({
                status: 404,
                message: "Workout not found",
            });
        }

        if (existingWorkout.user_id !== userId && !req.userToken.admin) {
            return res.json({
                status: 401,
                message: "Unauthorized to delete this workout",
            });
        }

        // Supprimer d'abord les détails du workout
        const deletedWorkoutDetails = await prisma.workout_Detail.deleteMany({
            where: { workout_id: parseInt(id) }
        });

        // Puis supprimer le workout
        const deletedWorkout = await prisma.workout.delete({
            where: { workout_id: parseInt(id) }
        });

        return res.json({
            status: 200,
            message: "Successfully deleted workout",
            data: {
                deletedWorkout,
                deletedDetailsCount: deletedWorkoutDetails.count
            }
        });

    } catch (err) {
        console.error('Delete workout error:', err);
        return res.json({
            status: 500,
            message: err.message || "Internal server error",
        }); 
    }
};


exports.getUserWorkouts = async (req, res, next) => {
    const userId = parseInt(req.userToken.id);
    try {
        const workouts = await prisma.workout.findMany({
            where: {
                user_id: userId,
            },
            include: {
                details: {
                  include: {
                    exercise: true
                  }
                },
                // user: true
            }
        });
        if (!workouts) {
            return res.json({
              status: 404,
              message: "Workouts not found",
            });
        }
        return res.json({
            status: 200,
            message: "Successfully retrieved all workouts",
            data: workouts
        });
    } catch (err) {
        return res.json({
            status: err.status,
            message: err.message || "Bad request",
        });
    }
};

