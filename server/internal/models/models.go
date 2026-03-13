package models

import "time"

type User struct {
	ID           int64      `json:"id"`
	Name         string     `json:"name"`
	Email        string     `json:"email"`
	PasswordHash string     `json:"-"`
	HeightCm     *int       `json:"height_cm,omitempty"`
	WeightKg     *float64   `json:"weight_kg,omitempty"`
	BirthDate    *time.Time `json:"birth_date,omitempty"`
	Gender       *string    `json:"gender,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
}

type TrainingGoal struct {
	ID         int64     `json:"id"`
	UserID     int64     `json:"user_id"`
	GoalName   string    `json:"goal_name"`
	DistanceKm float64   `json:"distance_km"`
	StartDate  time.Time `json:"start_date"`
	EndDate    time.Time `json:"end_date"`
	CreatedAt  time.Time `json:"created_at"`
}

type TrainingPlan struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	GoalID    int64     `json:"goal_id"`
	StartDate time.Time `json:"start_date"`
	EndDate   time.Time `json:"end_date"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type TrainingSession struct {
	ID                 int64             `json:"id"`
	PlanID             int64             `json:"plan_id"`
	ScheduledDate      time.Time         `json:"scheduled_date"`
	SessionType        string            `json:"session_type"`
	Title              string            `json:"title"`
	Description        *string           `json:"description,omitempty"`
	PlannedDurationMin *int              `json:"planned_duration_minutes,omitempty"`
	PlannedDistanceKm  *float64          `json:"planned_distance_km,omitempty"`
	DifficultyLevel    *string           `json:"difficulty_level,omitempty"`
	Status             string            `json:"status"`
	StartedAt          *time.Time        `json:"started_at,omitempty"`
	CompletedAt        *time.Time        `json:"completed_at,omitempty"`
	CreatedAt          time.Time         `json:"created_at"`
	Exercises          []SessionExercise `json:"exercises,omitempty"`
}

type Exercise struct {
	ID                 int64     `json:"id"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	DifficultyLevel    string    `json:"difficulty_level"`
	DefaultDurationMin int       `json:"default_duration_minutes"`
	CreatedAt          time.Time `json:"created_at"`
}

type SessionExercise struct {
	ID                int64    `json:"id"`
	SessionID         int64    `json:"session_id"`
	ExerciseID        int64    `json:"exercise_id"`
	SequenceNumber    int      `json:"sequence_number"`
	CustomDescription string   `json:"custom_description,omitempty"`
	CustomDurationMin *int     `json:"custom_duration_minutes,omitempty"`
	CustomDistanceKm  *float64 `json:"custom_distance_km,omitempty"`
	Title             string   `json:"title,omitempty"`
	Description       string   `json:"description,omitempty"`
	Duration          int      `json:"duration,omitempty"`
	DistanceKm        float64  `json:"distance_km,omitempty"`
}

type TrainingResult struct {
	ID                  int64     `json:"id"`
	SessionID           int64     `json:"session_id"`
	ActualDistanceKm    float64   `json:"actual_distance_km"`
	ActualDurationMin   int       `json:"actual_duration_minutes"`
	PerceivedDifficulty string    `json:"perceived_difficulty,omitempty"`
	Notes               string    `json:"notes,omitempty"`
	FeelingRating       int       `json:"feeling_rating,omitempty"`
	CreatedAt           time.Time `json:"created_at"`
}

type Notification struct {
	ID          int64      `json:"id"`
	UserID      int64      `json:"user_id"`
	Type        string     `json:"type"`
	Message     string     `json:"message"`
	Status      string     `json:"status"`
	ScheduledFor *time.Time `json:"scheduled_for,omitempty"`
	SentAt      *time.Time `json:"sent_at,omitempty"`
	ReadAt      *time.Time `json:"read_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}
