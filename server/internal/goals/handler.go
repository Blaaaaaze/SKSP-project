package goals

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/service-marathon-app/server/internal/middleware"
	"github.com/service-marathon-app/server/internal/models"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

type CreateGoalRequest struct {
	GoalName   string `json:"goal_name" binding:"required"`
	Distance   float64 `json:"distance" binding:"required,gt=0"`
	StartDate  string `json:"start_date" binding:"required"`
	EndDate    string `json:"end_date" binding:"required"`
}

func (h *Handler) Create(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid start_date format (use YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", req.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid end_date format (use YYYY-MM-DD)"})
		return
	}

	if endDate.Before(startDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "end_date must be after start_date"})
		return
	}

	goal := models.TrainingGoal{
		UserID:     userID,
		GoalName:   req.GoalName,
		DistanceKm: req.Distance,
		StartDate:  startDate,
		EndDate:    endDate,
	}

	created, err := h.repo.Create(c.Request.Context(), userID, goal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create goal"})
		return
	}

	c.JSON(http.StatusOK, created)
}

func (h *Handler) GetCurrent(c *gin.Context) {
	userID := middleware.GetUserID(c)

	goal, err := h.repo.GetLatestByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get goal"})
		return
	}
	if goal == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "no goal found"})
		return
	}

	c.JSON(http.StatusOK, goal)
}
