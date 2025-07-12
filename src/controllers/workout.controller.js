const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { workoutMetrics } = require('../metrics/workoutMetrics');

exports.createWorkout = async (req, res) => {
    const userId = parseInt(req.userToken.id);
    const startTime = process.hrtime();
    
    // Incrémenter le compteur de requêtes actives
    workoutMetrics.activeRequests.inc({ endpoint: '/api/workouts' });

    try {
        // Vérifier si nous recevons un plan IA
        if (req.body.plan && Array.isArray(req.body.plan)) {
            console.log("Processing AI generated plan");
            const planData = req.body.plan;
            
            // Traiter chaque workout du plan
            const createdWorkouts = await Promise.all(planData.map(async (workout) => {
                const workoutDetails = workout.details?.map(detail => ({
                    sets: detail.sets || 0,
                    reps: detail.reps || 0,
                    weight: detail.weight || 0,
                    completed: false,
                    completed_sets: 0,
                    completed_reps: 0,
                    completed_weight: 0,
                    exercise: {
                        connectOrCreate: {
                            where: {
                                name_goal_type: {
                                    name: detail.exercise.name,
                                    goal_type: detail.exercise.goal_type || 'GENERAL'
                                }
                            },
                            create: {
                                name: detail.exercise.name,
                                description: detail.exercise.description || '',
                                video_url: detail.exercise.video_url || '',
                                goal_type: detail.exercise.goal_type || 'GENERAL'
                            }
                        }
                    }
                })) || [];

                const createdWorkout = await prisma.workout.create({
                    data: {
                        user_id: userId,
                        name: workout.name,
                        date: new Date(workout.date),
                        duration: workout.duration || 0,
                        calories_burned: workout.calories_burned || 0,
                        details: {
                            create: workoutDetails
                        }
                    },
                    include: {
                        details: {
                            include: {
                                exercise: true
                            }
                        }
                    }
                });

                // Métriques après la création réussie
                // workoutMetrics.creationTotal.inc();
                // if (workout.duration) {
                //     workoutMetrics.duration.observe(workout.duration);
                // }
                // if (workout.calories_burned) {
                //     workoutMetrics.caloriesBurned.observe(workout.calories_burned);
                // }

                return createdWorkout;
            }));

            return res.status(201).json({
                status: 201,
                message: "Plan d'entraînement créé avec succès",
                data: createdWorkouts
            });
        }

        // Traitement d'un workout unique
        const { date, duration, calories_burned, details, name } = req.body;

        if (!date || !name) {
            return res.status(400).json({
                status: 400,
                message: "La date et le nom du workout sont requis",
            });
        }

        const detailsData = details?.map(detail => ({
            sets: detail.sets || 0,
            reps: detail.reps || 0,
            weight: detail.weight || 0,
            completed: false,
            completed_sets: 0,
            completed_reps: 0,
            completed_weight: 0,
            exercise: {
                connectOrCreate: {
                    where: {
                        name_goal_type: {
                            name: detail.exercise.name,
                            goal_type: detail.exercise.goal_type || 'GENERAL'
                        }
                    },
                    create: {
                        name: detail.exercise.name,
                        description: detail.exercise.description || '',
                        video_url: detail.exercise.video_url || '',
                        goal_type: detail.exercise.goal_type || 'GENERAL'
                    }
                }
            }
        })) || [];

        const result = await prisma.workout.create({
            data: {
                user_id: userId,
                name,
                date: new Date(date),
                duration: duration || 0,
                calories_burned: calories_burned || 0,
                details: {
                    create: detailsData
                }
            },
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });

        // Métriques après la création réussie
        workoutMetrics.creationTotal.inc();
        if (duration) {
            workoutMetrics.duration.observe(duration);
        }
        if (calories_burned) {
            workoutMetrics.caloriesBurned.observe(calories_burned);
        }

        // Mesurer la latence
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const requestDuration = seconds + nanoseconds / 1e9;
        workoutMetrics.apiLatency.observe({ endpoint: '/api/workouts', method: 'POST' }, requestDuration);

        // Décrémenter le compteur de requêtes actives
        workoutMetrics.activeRequests.dec({ endpoint: '/api/workouts' });

        return res.status(201).json({
            status: 201,
            message: "Workout créé avec succès",
            data: result
        });

    } catch (err) {
        // Incrémenter le compteur d'erreurs
        workoutMetrics.apiErrors.inc({ 
            endpoint: '/api/workouts', 
            method: 'POST',
            status: err.status || 500
        });

        // Décrémenter le compteur de requêtes actives
        workoutMetrics.activeRequests.dec({ endpoint: '/api/workouts' });

        console.error('Erreur création workout:', err);
        return res.status(500).json({
            status: 500,
            message: "Erreur lors de la création du workout: " + err.message,
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

        // Métriques pour le taux de complétion
        const completedDetails = finalWorkout.details.filter(d => d.completed).length;
        const totalDetails = finalWorkout.details.length;
        if (totalDetails > 0) {
            workoutMetrics.completionRate.set((completedDetails / totalDetails) * 100);
        }

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

