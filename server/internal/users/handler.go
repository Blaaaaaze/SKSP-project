package users

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/service-marathon-app/server/internal/middleware"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

type UserResponse struct {
	ID        int64   `json:"id"`
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	HeightCm  *int    `json:"height_cm,omitempty"`
	WeightKg  *float64 `json:"weight_kg,omitempty"`
	BirthDate *string `json:"birth_date,omitempty"`
	Gender    *string `json:"gender,omitempty"`
	CreatedAt string  `json:"created_at"`
}

func (h *Handler) GetMe(c *gin.Context) {
	userID := middleware.GetUserID(c)

	user, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	resp := UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		HeightCm:  user.HeightCm,
		WeightKg:  user.WeightKg,
		Gender:    user.Gender,
		CreatedAt: user.CreatedAt.Format("2006-01-02"),
	}
	if user.BirthDate != nil {
		s := user.BirthDate.Format("2006-01-02")
		resp.BirthDate = &s
	}

	c.JSON(http.StatusOK, resp)
}

type UpdateProfileRequest struct {
	Name      string   `json:"name" binding:"required"`
	HeightCm  *int     `json:"height_cm"`
	WeightKg  *float64 `json:"weight_kg"`
	BirthDate *string  `json:"birth_date"`
	Gender    *string  `json:"gender"`
}

func (h *Handler) UpdateMe(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := h.repo.Update(c.Request.Context(), userID, UpdateParams{
		Name:      req.Name,
		HeightCm:  req.HeightCm,
		WeightKg:  req.WeightKg,
		BirthDate: req.BirthDate,
		Gender:    req.Gender,
	}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	user, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil || user == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	resp := UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		HeightCm:  user.HeightCm,
		WeightKg:  user.WeightKg,
		Gender:    user.Gender,
		CreatedAt: user.CreatedAt.Format("2006-01-02"),
	}
	if user.BirthDate != nil {
		s := user.BirthDate.Format("2006-01-02")
		resp.BirthDate = &s
	}

	c.JSON(http.StatusOK, resp)
}
