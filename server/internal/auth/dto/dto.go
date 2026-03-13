package dto

type RegisterRequest struct {
	Name      string  `json:"name" binding:"required"`
	Email     string  `json:"email" binding:"required"`
	Password  string  `json:"password" binding:"required"`
	HeightCm  *int    `json:"height_cm"`
	WeightKg  *float64 `json:"weight_kg"`
	BirthDate *string `json:"birth_date"`
	Gender    *string `json:"gender"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
}
