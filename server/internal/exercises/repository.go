package exercises

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

func (r *Repository) GetByID(ctx context.Context, id int64) (*models.Exercise, error) {
	var e models.Exercise
	err := r.pool.QueryRow(ctx, `
		SELECT id, title, description, difficulty_level, default_duration_minutes, created_at
		FROM exercises WHERE id = $1
	`, id).Scan(&e.ID, &e.Title, &e.Description, &e.DifficultyLevel, &e.DefaultDurationMin, &e.CreatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &e, nil
}

func (r *Repository) GetBySessionID(ctx context.Context, sessionID int64) ([]models.SessionExercise, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT tse.id, tse.session_id, tse.exercise_id, tse.sequence_number, tse.custom_description, tse.custom_duration_minutes, tse.custom_distance_km,
		       e.title, e.description, COALESCE(tse.custom_duration_minutes, e.default_duration_minutes, 0), COALESCE(tse.custom_distance_km, 0)::float8
		FROM training_session_exercises tse
		JOIN exercises e ON e.id = tse.exercise_id
		WHERE tse.session_id = $1
		ORDER BY tse.sequence_number
	`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []models.SessionExercise
	for rows.Next() {
		var se models.SessionExercise
		var customDesc *string
		var customDur *int32
		var customDist *float64
		var distKm float64
		err := rows.Scan(&se.ID, &se.SessionID, &se.ExerciseID, &se.SequenceNumber, &customDesc, &customDur, &customDist, &se.Title, &se.Description, &se.Duration, &distKm)
		if err != nil {
			return nil, err
		}
		if customDesc != nil {
			se.CustomDescription = *customDesc
		}
		if customDur != nil {
			se.CustomDurationMin = ptr(int(*customDur))
		}
		se.CustomDistanceKm = customDist
		se.DistanceKm = distKm
		result = append(result, se)
	}
	return result, rows.Err()
}

func (r *Repository) GetWarmupID(ctx context.Context) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `SELECT id FROM exercises WHERE title = 'Разминка' LIMIT 1`).Scan(&id)
	return id, err
}

func (r *Repository) GetCooldownID(ctx context.Context) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `SELECT id FROM exercises WHERE title = 'Заминка' LIMIT 1`).Scan(&id)
	return id, err
}

func (r *Repository) GetEasyRunID(ctx context.Context) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `SELECT id FROM exercises WHERE title = 'Легкий бег' LIMIT 1`).Scan(&id)
	return id, err
}

func (r *Repository) GetIntervalID(ctx context.Context) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `SELECT id FROM exercises WHERE title = 'Интервалы' LIMIT 1`).Scan(&id)
	return id, err
}

func (r *Repository) GetLongRunID(ctx context.Context) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `SELECT id FROM exercises WHERE title = 'Длинная пробежка' LIMIT 1`).Scan(&id)
	return id, err
}

func (r *Repository) GetRecoveryID(ctx context.Context) (int64, error) {
	var id int64
	err := r.pool.QueryRow(ctx, `SELECT id FROM exercises WHERE title = 'Восстановительный бег' LIMIT 1`).Scan(&id)
	return id, err
}

func ptr(i int) *int { return &i }
