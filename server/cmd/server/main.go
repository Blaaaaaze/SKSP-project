package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/service-marathon-app/server/internal/database"
	"github.com/service-marathon-app/server/internal/middleware"
	"github.com/service-marathon-app/server/internal/router"
	"go.uber.org/zap"
)

func main() {
		logger, _ := zap.NewProduction()
	defer logger.Sync()

	dbURL := getEnv("DATABASE_URL", "postgres://app:app@localhost:5432/marathon?sslmode=disable")
	port := getEnv("PORT", "8080")

	db, err := database.New(dbURL)
	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	if err := database.RunMigrations(dbURL); err != nil {
		logger.Fatal("failed to run migrations", zap.Error(err))
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(middleware.CORS())
	r.Use(gin.Recovery())
	r.Use(middleware.Logger(logger))

	router.Setup(r, db, logger)

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logger.Info("server starting", zap.String("port", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("server failed", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("server shutdown error", zap.Error(err))
	}
	logger.Info("server stopped")
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}