const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { workoutMetrics, exerciseMetrics } = require('../metrics');

// exports.createWorkout = async (req, res) => {
//   const userId = Number(req.userToken.id);
//   const startTime = process.hrtime();

//   console.log('Creating workout for user ID:', userId, 'Type:', typeof userId);

//   try {
//     // Vérifier si l'utilisateur existe
//     const user = await prisma.User.findUnique({
//       where: { user_id: userId },
//     });

//     if (!user) {
//       return res.status(404).json({
//         status: 404,
//         message: 'User not found',
//       });
//     }

//     // Vérifier si nous recevons un plan IA
//     if (req.body.plan && Array.isArray(req.body.plan)) {
//       console.log('Processing AI generated plan');
//       const planData = req.body.plan;

//       // Traiter chaque workout du plan
//       const createdWorkouts = await Promise.all(
//         planData.map(async (workout) => {
//           const workoutDetails =
//             workout.details?.map((detail) => ({
//               sets: detail.sets || 0,
//               reps: detail.reps || 0,
//               weight: detail.weight || 0,
//               completed: false,
//               completed_sets: 0,
//               completed_reps: 0,
//               completed_weight: 0,
//               exercise: {
//                 connectOrCreate: {
//                   where: {
//                     name_goal_type: {
//                       name: detail.exercise.name,
//                       goal_type: detail.exercise.goal_type || 'GENERAL',
//                     },
//                   },
//                   create: {
//                     name: detail.exercise.name,
//                     description: detail.exercise.description || '',
//                     video_url: detail.exercise.video_url || '',
//                     goal_type: detail.exercise.goal_type || 'GENERAL',
//                   },
//                 },
//               },
//             })) || [];

//           return await prisma.Workout.create({
//             data: {
//               user_id: userId,
//               name: workout.name,
//               date: new Date(workout.date),
//               duration: workout.duration || 0,
//               calories_burned: workout.calories_burned || 0,
//               details: {
//                 create: workoutDetails,
//               },
//             },
//             include: {
//               details: {
//                 include: {
//                   exercise: true,
//                 },
//               },
//             },
//           });
//         })
//       );

//       return res.status(201).json({
//         status: 201,
//         message: "Plan d'entraînement créé avec succès",
//         data: createdWorkouts[0],
//       });
//     }

//     // Traitement d'un workout unique
//     const { date, duration, calories_burned, details, name } = req.body;

//     if (!date || !name) {
//       return res.status(400).json({
//         status: 400,
//         message: 'La date et le nom du workout sont requis',
//       });
//     }

//     const detailsData =
//       details?.map((detail) => ({
//         sets: detail.sets || 0,
//         reps: detail.reps || 0,
//         weight: detail.weight || 0,
//         completed: false,
//         completed_sets: 0,
//         completed_reps: 0,
//         completed_weight: 0,
//         exercise: {
//           connectOrCreate: {
//             where: {
//               name_goal_type: {
//                 name: detail.exercise.name,
//                 goal_type: detail.exercise.goal_type || 'GENERAL',
//               },
//             },
//             create: {
//               name: detail.exercise.name,
//               description: detail.exercise.description || '',
//               video_url: detail.exercise.video_url || '',
//               goal_type: detail.exercise.goal_type || 'GENERAL',
//             },
//           },
//         },
//       })) || [];

//     const result = await prisma.Workout.create({
//       data: {
//         user_id: userId,
//         name,
//         date: new Date(date),
//         duration: duration || 0,
//         calories_burned: calories_burned || 0,
//         details: {
//           create: detailsData,
//         },
//       },
//       include: {
//         details: {
//           include: {
//             exercise: true,
//           },
//         },
//       },
//     });

//     // Métriques après la création réussie
//     workoutMetrics.creationTotal.inc();
//     if (duration) {
//       workoutMetrics.duration.observe(duration);
//     }
//     if (calories_burned) {
//       workoutMetrics.caloriesBurned.observe(calories_burned);
//     }

//     // Mesurer la latence
//     const [seconds, nanoseconds] = process.hrtime(startTime);
//     const requestDuration = seconds + nanoseconds / 1e9;
//     workoutMetrics.apiLatency.observe(
//       { endpoint: '/api/workouts', method: 'POST' },
//       requestDuration
//     );

//     return res.status(201).json({
//       status: 201,
//       message: 'Workout créé avec succès',
//       data: result,
//     });
//   } catch (err) {
//     console.error('Erreur création workout:', err);

//     // Incrémenter le compteur d'erreurs
//     workoutMetrics.apiErrors.inc({
//       endpoint: '/api/workouts',
//       method: 'POST',
//       status: 500,
//     });

//     return res.status(500).json({
//       status: 500,
//       message: 'Erreur lors de la création du workout: ' + err.message,
//     });
//   }
// };

exports.createWorkout = async (req, res) => {
  const userId = Number(req.userToken.id);
  const startTime = process.hrtime();

  try {
    // 1) Vérifier que l’utilisateur existe
    const user = await prisma.User.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    // 2) Si on a un plan IA (array), on crée tout en transaction
    if (req.body.plan && Array.isArray(req.body.plan)) {
      const planData = req.body.plan;

      // Préparation des opérations
      const ops = planData.map((workout) => {
        const details =
          workout.details?.map((d) => ({
            sets: d.sets || 0,
            reps: d.reps || 0,
            weight: d.weight || 0,
            completed: false,
            completed_sets: 0,
            completed_reps: 0,
            completed_weight: 0,
            exercise: {
              connectOrCreate: {
                where: {
                  name_goal_type: {
                    name: d.exercise.name,
                    goal_type: d.exercise.goal_type || 'GENERAL',
                  },
                },
                create: {
                  name: d.exercise.name,
                  description: d.exercise.description || '',
                  video_url: d.exercise.video_url || '',
                  goal_type: d.exercise.goal_type || 'GENERAL',
                },
              },
            },
          })) || [];

        return prisma.Workout.create({
          data: {
            user_id: userId,
            name: workout.name,
            date: new Date(workout.date),
            duration: workout.duration || 0,
            calories_burned: workout.calories_burned || 0,
            details: { create: details },
          },
          include: {
            details: { include: { exercise: true } },
          },
        });
      });

      // Exécution en une seule transaction
      const createdWorkouts = await prisma.$transaction(ops);

      return res.status(201).json({
        status: 201,
        message: "Plan d'entraînement créé avec succès",
        data: createdWorkouts[0],
      });
    }

    // 3) Sinon on crée un workout simple (sérialisé)
    const { name, date, duration, calories_burned, details } = req.body;
    if (!name || !date) {
      return res.status(400).json({
        status: 400,
        message: 'La date et le nom du workout sont requis',
      });
    }

    const detailsData =
      details?.map((d) => ({
        sets: d.sets || 0,
        reps: d.reps || 0,
        weight: d.weight || 0,
        completed: false,
        completed_sets: 0,
        completed_reps: 0,
        completed_weight: 0,
        exercise: {
          connectOrCreate: {
            where: {
              name_goal_type: {
                name: d.exercise.name,
                goal_type: d.exercise.goal_type || 'GENERAL',
              },
            },
            create: {
              name: d.exercise.name,
              description: d.exercise.description || '',
              video_url: d.exercise.video_url || '',
              goal_type: d.exercise.goal_type || 'GENERAL',
            },
          },
        },
      })) || [];

    const result = await prisma.Workout.create({
      data: {
        user_id: userId,
        name,
        date: new Date(date),
        duration: duration || 0,
        calories_burned: calories_burned || 0,
        details: { create: detailsData },
      },
      include: {
        details: { include: { exercise: true } },
      },
    });

    // 4) Métriques & latence
    workoutMetrics.creationCount.inc({
      type: 'manual',
      user_id: userId.toString(),
    });
    if (duration) {
      workoutMetrics.duration.observe(
        { type: 'manual', user_id: userId.toString() },
        duration
      );
    }
    if (calories_burned) {
      workoutMetrics.caloriesBurned.observe(
        { type: 'manual', user_id: userId.toString() },
        calories_burned
      );
    }

    // Métriques pour les exercices créés
    if (details && details.length > 0) {
      details.forEach((detail) => {
        if (detail.exercise) {
          exerciseMetrics.creationCount.inc({
            exercise_name: detail.exercise.name,
            goal_type: detail.exercise.goal_type || 'GENERAL',
          });
        }
      });
    }

    return res.status(201).json({
      status: 201,
      message: 'Workout créé avec succès',
      data: result,
    });
  } catch (err) {
    console.error('Erreur création workout:', err);

    // Métriques d'erreur
    console.error('Erreur création workout:', err);

    return res.status(500).json({
      status: 500,
      message: 'Erreur lors de la création du workout: ' + err.message,
    });
  }
};

exports.getWorkouts = async (req, res) => {
  if (!req.userToken.admin) {
    return res.status(400).json({
      status: 400,
      message: 'Only admin can access',
    });
  }
  try {
    const workouts = await prisma.Workout.findMany({
      include: {
        details: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Successfully retrieved all workouts',
      data: workouts,
    });
  } catch (err) {
    console.error('Get workouts error:', err);
    return res.status(500).json({
      status: 500,
      message: err.message || 'Internal server error',
    });
  }
};

exports.getUserWorkouts = async (req, res) => {
  const userId = Number(req.userToken.id);
  try {
    const workouts = await prisma.Workout.findMany({
      where: {
        user_id: userId,
      },
      include: {
        details: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: 200,
      message: 'Successfully retrieved user workouts',
      data: workouts,
    });
  } catch (err) {
    console.error('Get user workouts error:', err);
    return res.status(500).json({
      status: 500,
      message: err.message || 'Internal server error',
    });
  }
};

exports.getWorkoutById = async (req, res) => {
  try {
    const workoutId = Number(req.params.id);
    const userId = Number(req.userToken.id);

    if (isNaN(workoutId)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid workout ID',
      });
    }

    const workout = await prisma.Workout.findFirst({
      where: {
        workout_id: workoutId,
        user_id: userId,
      },
      include: {
        details: {
          include: {
            exercise: true,
          },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({
        status: 404,
        message: 'Workout not found',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Successfully retrieved workout',
      data: workout,
    });
  } catch (err) {
    console.error('Get workout by id error:', err);
    return res.status(500).json({
      status: 500,
      message: err.message || 'Internal server error',
    });
  }
};

exports.updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = parseInt(req.userToken.id);
    const { date, duration, calories_burned, details, name } = req.body;

    if (!id) {
      return res.status(400).json({
        status: 400,
        message: 'Workout ID is required',
      });
    }

    // Vérifier que le workout appartient à l'utilisateur
    const existingWorkout = await prisma.Workout.findUnique({
      where: { workout_id: parseInt(id) },
      include: { details: true },
    });

    if (!existingWorkout) {
      return res.status(404).json({
        status: 404,
        message: 'Workout not found',
      });
    }

    if (existingWorkout.user_id !== userId && !req.userToken.admin) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized to update this workout',
      });
    }

    // Supprimer les anciens détails
    await prisma.Workout_Detail.deleteMany({
      where: { workout_id: parseInt(id) },
    });

    // Préparer les nouveaux détails si fournis
    let detailsData = [];
    if (details && Array.isArray(details)) {
      // Créer ou récupérer les exercices d'abord
      const exercisePromises = details.map(async (detail) => {
        let exercise;

        // Vérifier si on a un objet exercise complet ou juste un exercise_id
        if (detail.exercise && detail.exercise.name) {
          // Cas où on a un objet exercise complet (création)
          exercise = await prisma.Exercise.findFirst({
            where: {
              name: detail.exercise.name,
              goal_type: detail.exercise.goal_type || 'GENERAL',
            },
          });

          if (!exercise) {
            exercise = await prisma.Exercise.create({
              data: {
                name: detail.exercise.name,
                description:
                  detail.exercise.description ||
                  `Exercice ${detail.exercise.name}`,
                goal_type: detail.exercise.goal_type || 'GENERAL',
                video_url: detail.exercise.video_url || null,
              },
            });
          }
        } else {
          // Cas où on a juste un exercise_id (mise à jour)
          const exerciseNames = {
            1: 'Pompes',
            2: 'Squats',
            3: 'Planche',
            4: 'Burpees',
            5: 'Mountain Climbers',
            6: 'Développé couché',
            7: 'Tractions',
            8: 'Deadlift',
            9: 'Dips',
            10: 'Rowing',
            11: 'Fentes',
            12: 'Gainage latéral',
          };

          const exerciseName = exerciseNames[detail.exercise_id] || 'Pompes';

          exercise = await prisma.Exercise.findFirst({
            where: {
              name: exerciseName,
              goal_type: 'GENERAL',
            },
          });

          if (!exercise) {
            exercise = await prisma.Exercise.create({
              data: {
                name: exerciseName,
                description: `Exercice ${exerciseName}`,
                goal_type: 'GENERAL',
              },
            });
          }
        }

        return {
          workout_id: parseInt(id),
          exercise_id: exercise.exercise_id,
          sets: detail.sets || 0,
          reps: detail.reps || 0,
          weight: detail.weight || 0,
          completed: false,
          completed_sets: 0,
          completed_reps: 0,
          completed_weight: 0,
        };
      });

      detailsData = await Promise.all(exercisePromises);
    }

    // Mettre à jour le workout
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (date) updateData.date = new Date(date);
    if (duration !== undefined) updateData.duration = duration;
    if (calories_burned !== undefined)
      updateData.calories_burned = calories_burned;

    console.log('Updating workout with data:', updateData);

    const updatedWorkout = await prisma.Workout.update({
      where: { workout_id: parseInt(id) },
      data: updateData,
    });

    // Créer les nouveaux détails
    if (detailsData.length > 0) {
      console.log('Creating new details:', detailsData);
      await prisma.Workout_Detail.createMany({
        data: detailsData,
      });
    }

    // Récupérer le workout final avec tous les détails
    const finalWorkout = await prisma.Workout.findUnique({
      where: { workout_id: parseInt(id) },
      include: {
        details: {
          include: {
            exercise: true,
          },
        },
      },
    });

    console.log('Final workout after update:', finalWorkout);

    // Métriques de mise à jour
    workoutMetrics.updateCount.inc({ user_id: userId.toString() });

    return res.status(200).json({
      status: 200,
      message: 'Successfully updated workout',
      data: finalWorkout,
    });
  } catch (err) {
    console.error('Update workout error:', err);
    return res.status(500).json({
      status: 500,
      message: err.message || 'Internal server error',
    });
  }
};

exports.deleteWorkout = async (req, res) => {
  try {
    const workoutId = Number(req.params.id);
    const userId = Number(req.userToken.id);

    if (isNaN(workoutId)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid workout ID',
      });
    }

    // Vérifier que le workout existe et appartient à l'utilisateur
    const existingWorkout = await prisma.Workout.findFirst({
      where: {
        workout_id: workoutId,
        user_id: userId,
      },
    });

    if (!existingWorkout) {
      return res.status(404).json({
        status: 404,
        message: 'Workout not found',
      });
    }

    // Supprimer les détails du workout d'abord
    await prisma.Workout_Detail.deleteMany({
      where: { workout_id: workoutId },
    });

    // Supprimer le workout
    await prisma.Workout.delete({
      where: { workout_id: workoutId },
    });

    // Métriques de suppression
    workoutMetrics.deleteCount.inc({ user_id: userId.toString() });

    return res.status(204).send();
  } catch (err) {
    console.error('Delete workout error:', err);
    return res.status(500).json({
      status: 500,
      message: err.message || 'Internal server error',
    });
  }
};
