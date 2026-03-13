package router

import (
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/service-marathon-app/server/internal/auth"
	"github.com/service-marathon-app/server/internal/exercises"
	"github.com/service-marathon-app/server/internal/goals"
	"github.com/service-marathon-app/server/internal/middleware"
	"github.com/service-marathon-app/server/internal/notifications"
	"github.com/service-marathon-app/server/internal/statistics"
	"github.com/service-marathon-app/server/internal/training"
	"github.com/service-marathon-app/server/internal/users"
	"github.com/service-marathon-app/server/pkg/jwt"
	"go.uber.org/zap"
)

func Setup(r *gin.Engine, db *pgxpool.Pool, log *zap.Logger) {
	jwtSecret := getEnv("JWT_SECRET", "marathon-secret-change-in-production")
	jwtManager := jwt.NewManager(jwtSecret, 24*7*time.Hour) // 7 days

	authMiddleware := middleware.Auth(jwtManager)

	userRepo := users.NewRepository(db)
	authHandler := auth.NewHandler(userRepo, jwtManager, log)
	usersHandler := users.NewHandler(userRepo)

	goalsRepo := goals.NewRepository(db)
	goalsHandler := goals.NewHandler(goalsRepo)

	trainingRepo := training.NewRepository(db)
	exerciseRepo := exercises.NewRepository(db)
	trainingGenerator := training.NewGenerator(trainingRepo, exerciseRepo)
	notifRepo := notifications.NewRepository(db)
	trainingHandler := training.NewHandler(trainingRepo, exerciseRepo, goalsRepo, trainingGenerator, notifRepo)

	statsRepo := statistics.NewRepository(db)
	statsHandler := statistics.NewHandler(statsRepo)

	notifHandler := notifications.NewHandler(notifRepo)

	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

	api := r.Group("/api")
	{
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
		}

		api.Use(authMiddleware)
		{
			api.GET("/users/me", usersHandler.GetMe)
			api.PATCH("/users/me", usersHandler.UpdateMe)
			api.POST("/goals", goalsHandler.Create)
			api.GET("/goals/current", goalsHandler.GetCurrent)
			api.POST("/training-plan/generate", trainingHandler.GeneratePlan)
			api.GET("/calendar", trainingHandler.GetCalendar)
			api.GET("/training/:id", trainingHandler.GetSession)
			api.POST("/training/:id/start", trainingHandler.StartSession)
			api.POST("/training/:id/complete", trainingHandler.CompleteSession)
			api.GET("/statistics", statsHandler.Get)
			api.GET("/notifications", notifHandler.List)
			api.POST("/notifications/:id/read", notifHandler.MarkRead)
		}
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
