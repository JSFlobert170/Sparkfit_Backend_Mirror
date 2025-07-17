const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { workoutMetrics } = require('../metrics/workoutMetrics');

exports.createWorkout = async (req, res) => {
    const userId = Number(req.userToken.id);
    const startTime = process.hrtime();
    
    console.log('Creating workout for user ID:', userId, 'Type:', typeof userId);
    
    try {
        // Vérifier si l'utilisateur existe
        const user = await prisma.User.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            return res.status(404).json({
                status: 404,
                message: "User not found"
            });
        }

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

                return await prisma.Workout.create({
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
            }));

            return res.status(201).json({
                status: 201,
                message: "Plan d'entraînement créé avec succès",
                data: createdWorkouts[0]
            });
        }

        // Traitement d'un workout unique
        const { date, duration, calories_burned, details, name } = req.body;

        if (!date || !name) {
            return res.status(400).json({
                status: 400,
                message: "La date et le nom du workout sont requis"
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

        const result = await prisma.Workout.create({
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

        return res.status(201).json({
            status: 201,
            message: "Workout créé avec succès",
            data: result
        });

    } catch (err) {
        console.error('Erreur création workout:', err);
        
        // Incrémenter le compteur d'erreurs
        workoutMetrics.apiErrors.inc({ 
            endpoint: '/api/workouts', 
            method: 'POST',
            status: 500
        });

        return res.status(500).json({
            status: 500,
            message: "Erreur lors de la création du workout: " + err.message
        });
    }
};

exports.getWorkouts = async (req, res) => {
    if (!req.userToken.admin) {
        return res.status(400).json({
            status: 400,
            message: "Only admin can access"
        });
    }
    try {
        const workouts = await prisma.Workout.findMany({
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });
        
        return res.status(200).json({
            status: 200,
            message: "Successfully retrieved all workouts",
            data: workouts
        });
    } catch (err) {
        console.error('Get workouts error:', err);
        return res.status(500).json({
            status: 500,
            message: err.message || "Internal server error"
        });
    }
};

exports.getUserWorkouts = async (req, res) => {
    const userId = Number(req.userToken.id);
    try {
        const workouts = await prisma.Workout.findMany({
            where: {
                user_id: userId
            },
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });
        
        return res.status(200).json({
            status: 200,
            message: "Successfully retrieved user workouts",
            data: workouts
        });
    } catch (err) {
        console.error('Get user workouts error:', err);
        return res.status(500).json({
            status: 500,
            message: err.message || "Internal server error"
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
                message: "Invalid workout ID"
            });
        }

        const workout = await prisma.Workout.findFirst({
            where: { 
                workout_id: workoutId,
                user_id: userId
            },
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });

        if (!workout) {
            return res.status(404).json({
                status: 404,
                message: "Workout not found"
            });
        }

        return res.status(200).json({
            status: 200,
            message: "Successfully retrieved workout",
            data: workout
        });
    } catch (err) {
        console.error('Get workout by id error:', err);
        return res.status(500).json({
            status: 500,
            message: err.message || "Internal server error"
        });
    }
};

exports.updateWorkout = async (req, res) => {
    try {
        const workoutId = Number(req.params.id);
        const userId = Number(req.userToken.id);
        const { name, duration, calories_burned } = req.body;

        if (isNaN(workoutId)) {
            return res.status(400).json({
                status: 400,
                message: "Invalid workout ID"
            });
        }

        // Vérifier que le workout existe et appartient à l'utilisateur
        const existingWorkout = await prisma.Workout.findFirst({
            where: { 
                workout_id: workoutId,
                user_id: userId
            }
        });

        if (!existingWorkout) {
            return res.status(404).json({
                status: 404,
                message: "Workout not found"
            });
        }

        // Mettre à jour le workout
        const updatedWorkout = await prisma.Workout.update({
            where: { 
                workout_id: workoutId
            },
            data: {
                name: name || existingWorkout.name,
                duration: duration || existingWorkout.duration,
                calories_burned: calories_burned || existingWorkout.calories_burned
            },
            include: {
                details: {
                    include: {
                        exercise: true
                    }
                }
            }
        });

        return res.status(200).json({
            status: 200,
            message: "Workout updated successfully",
            data: updatedWorkout
        });
    } catch (err) {
        console.error('Update workout error:', err);
        return res.status(500).json({
            status: 500,
            message: err.message || "Internal server error"
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
                message: "Invalid workout ID"
            });
        }

        // Vérifier que le workout existe et appartient à l'utilisateur
        const existingWorkout = await prisma.Workout.findFirst({
            where: { 
                workout_id: workoutId,
                user_id: userId
            }
        });

        if (!existingWorkout) {
            return res.status(404).json({
                status: 404,
                message: "Workout not found"
            });
        }

        // Supprimer les détails du workout d'abord
        await prisma.Workout_Detail.deleteMany({
            where: { workout_id: workoutId }
        });

        // Supprimer le workout
        await prisma.Workout.delete({
            where: { workout_id: workoutId }
        });

        return res.status(204).send();
    } catch (err) {
        console.error('Delete workout error:', err);
        return res.status(500).json({
            status: 500,
            message: err.message || "Internal server error"
        });
    }
};

