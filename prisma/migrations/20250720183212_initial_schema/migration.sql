-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "profile_picture" TEXT,
    "user_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "age" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "intensity" TEXT,
    "fitness_goal" TEXT,
    "goal_detail" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "subscription_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "workout_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER DEFAULT 0,
    "calories_burned" INTEGER DEFAULT 0,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("workout_id")
);

-- CreateTable
CREATE TABLE "Workout_Detail" (
    "detail_id" SERIAL NOT NULL,
    "workout_id" INTEGER NOT NULL,
    "exercise_id" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 0,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_sets" INTEGER NOT NULL DEFAULT 0,
    "completed_reps" INTEGER NOT NULL DEFAULT 0,
    "completed_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Workout_Detail_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "exercise_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "video_url" TEXT,
    "goal_type" TEXT NOT NULL DEFAULT 'GENERAL',

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("exercise_id")
);

-- CreateTable
CREATE TABLE "Meal_Plan" (
    "meal_plan_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meal_type" TEXT NOT NULL,
    "exercise_id" INTEGER,

    CONSTRAINT "Meal_Plan_pkey" PRIMARY KEY ("meal_plan_id")
);

-- CreateTable
CREATE TABLE "Meal_Plan_Detail" (
    "detail_id" SERIAL NOT NULL,
    "meal_plan_id" INTEGER NOT NULL,
    "recipe_id" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Meal_Plan_Detail_pkey" PRIMARY KEY ("detail_id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "recipe_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "prep_time" INTEGER NOT NULL DEFAULT 0,
    "cook_time" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("recipe_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_key" ON "Subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_goal_type_key" ON "Exercise"("name", "goal_type");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout_Detail" ADD CONSTRAINT "Workout_Detail_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "Workout"("workout_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout_Detail" ADD CONSTRAINT "Workout_Detail_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "Exercise"("exercise_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal_Plan" ADD CONSTRAINT "Meal_Plan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal_Plan" ADD CONSTRAINT "Meal_Plan_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "Exercise"("exercise_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal_Plan_Detail" ADD CONSTRAINT "Meal_Plan_Detail_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "Meal_Plan"("meal_plan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal_Plan_Detail" ADD CONSTRAINT "Meal_Plan_Detail_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "Recipe"("recipe_id") ON DELETE RESTRICT ON UPDATE CASCADE;
