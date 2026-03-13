package goals

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/service-marathon-app/server/internal/models"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, userID int64, goal models.TrainingGoal) (*models.TrainingGoal, error) {
	err := r.pool.QueryRow(ctx, `
		INSERT INTO training_goals (user_id, goal_name, distance_km, start_date, end_date)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, goal_name, distance_km, start_date, end_date, created_at
	`, userID, goal.GoalName, goal.DistanceKm, goal.StartDate, goal.EndDate).Scan(
		&goal.ID, &goal.UserID, &goal.GoalName, &goal.DistanceKm, &goal.StartDate, &goal.EndDate, &goal.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

func (r *Repository) GetByID(ctx context.Context, id int64, userID int64) (*models.TrainingGoal, error) {
	var goal models.TrainingGoal
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, goal_name, distance_km, start_date, end_date, created_at
		FROM training_goals WHERE id = $1 AND user_id = $2
	`, id, userID).Scan(&goal.ID, &goal.UserID, &goal.GoalName, &goal.DistanceKm, &goal.StartDate, &goal.EndDate, &goal.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

func (r *Repository) GetLatestByUser(ctx context.Context, userID int64) (*models.TrainingGoal, error) {
	var goal models.TrainingGoal
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, goal_name, distance_km, start_date, end_date, created_at
		FROM training_goals WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
	`, userID).Scan(&goal.ID, &goal.UserID, &goal.GoalName, &goal.DistanceKm, &goal.StartDate, &goal.EndDate, &goal.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &goal, nil
}
