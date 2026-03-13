package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/service-marathon-app/server/internal/auth/dto"
	"github.com/service-marathon-app/server/internal/users"
	"go.uber.org/zap"
)

type Handler struct {
	users *users.Repository
	jwt   JWTManager
	log   *zap.Logger
}

type JWTManager interface {
	Generate(userID int64, email string) (string, error)
}

func NewHandler(users *users.Repository, jwt JWTManager, log *zap.Logger) *Handler {
	return &Handler{users: users, jwt: jwt, log: log}
}

func (h *Handler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Name == "" || req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name, email and password are required"})
		return
	}

	user, err := h.users.Create(c.Request.Context(), users.CreateParams{
		Name:      req.Name,
		Email:     req.Email,
		Password:  req.Password,
		HeightCm:  req.HeightCm,
		WeightKg:  req.WeightKg,
		BirthDate: req.BirthDate,
		Gender:    req.Gender,
	})
	if err != nil {
		if users.IsEmailExists(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
			return
		}
		h.log.Error("create user failed", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	token, err := h.jwt.Generate(user.ID, user.Email)
	if err != nil {
		h.log.Error("generate token failed", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{Token: token})
}

func (h *Handler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Email == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	user, err := h.users.GetByEmail(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	if !users.CheckPassword(user.PasswordHash, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := h.jwt.Generate(user.ID, user.Email)
	if err != nil {
		h.log.Error("generate token failed", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, dto.AuthResponse{Token: token})
}
