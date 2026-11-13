package repository

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"uleam-eventos-api/internal/config"
)

type Database struct {
	Conn *sql.DB
}

func NewDatabase(cfg *config.Config) (*Database, error) {
	if cfg.DatabaseURL == "" {
		log.Println("[AVISO] DATABASE_URL no configurada. El servidor iniciará en modo autónomo con repositorio en memoria/fallback.")
		return &Database{Conn: nil}, nil
	}

	db, err := sql.Open("postgres", cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("error al abrir conexión PostgreSQL: %w", err)
	}

	if err := db.Ping(); err != nil {
		log.Printf("[ALERTA] No se pudo hacer ping a Supabase PostgreSQL: %v", err)
		log.Println("[AVISO] Operando con fallback en memoria para desarrollo local.")
		return &Database{Conn: nil}, nil
	}

	log.Println("[ÉXITO] Conexión establecida exitosamente con PostgreSQL / Supabase.")
	return &Database{Conn: db}, nil
}
