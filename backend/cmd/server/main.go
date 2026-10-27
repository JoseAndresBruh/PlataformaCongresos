package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"uleam-eventos-api/internal/config"
	"uleam-eventos-api/internal/domain"
	"uleam-eventos-api/internal/handlers"
	"uleam-eventos-api/internal/middleware"
	"uleam-eventos-api/internal/repository"
)

func main() {
	cfg := config.LoadConfig()

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Conexión a Base de Datos (PostgreSQL en Supabase)
	db, err := repository.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("Fallo crítico en base de datos: %v", err)
	}
	if db.Conn != nil {
		defer db.Conn.Close()
	}

	repo := repository.NewPostgresRepo(db)
	api := handlers.NewAPIHandler(repo, cfg)

	router := gin.Default()
	router.Use(middleware.CORSMiddleware(cfg))

	// Grupo API v1
	v1 := router.Group("/api/v1")
	{
		// Health check
		v1.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"status":      "online",
				"sistema":     "ULEAM-EVENTOS API (Go)",
				"version":     "1.0.0",
				"postgres_db": db.Conn != nil,
			})
		})

		// Rutas públicas de Autenticación (RF-001, RF-002)
		v1.POST("/auth/login", api.Login)
		v1.POST("/auth/register", api.Register)

		// Portal Público de Eventos (RF-010, RF-011)
		v1.GET("/eventos", api.GetEvents)
		v1.GET("/eventos/:slug", api.GetEventBySlug)
		v1.POST("/eventos", api.CreateEvent) // Creación directa de eventos (RF-006)

		// Inscripciones (RF-012)
		v1.POST("/inscripciones", api.CreateRegistration)
		v1.GET("/inscripciones", api.GetRegistrations)
		v1.PATCH("/inscripciones/:id/revision", api.ReviewRegistration) // Revisión de comprobante directa

		// Control de Acceso y Escaneo de QR (RF-015)
		v1.POST("/asistencia/check-in", api.CheckIn)

		// Encuestas y Certificados (RF-016, RF-017)
		v1.POST("/encuestas/responder", api.SubmitSurvey)
		v1.GET("/certificados", api.GetCertificates)

		// Dashboard Métricas en tiempo real (RF-019, RF-023)
		v1.GET("/dashboard/metricas", api.GetDashboard)

		// Rutas Protegidas Administrativas (RBAC - RNF-006)
		adminGroup := v1.Group("/admin")
		adminGroup.Use(middleware.AuthMiddleware(cfg, domain.RoleSuperAdmin, domain.RoleAdminEvento, domain.RolePersonalGestion))
		{
			adminGroup.POST("/eventos", api.CreateEvent)
			adminGroup.PATCH("/eventos/:id/estado", api.UpdateEventStatus)
			adminGroup.PATCH("/inscripciones/:id/revision", api.ReviewRegistration)
		}
	}

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("=====================================================")
	log.Printf("🚀 SERVIDOR ULEAM-EVENTOS (Go/Gin) INICIADO EN PUERTO %s", cfg.Port)
	log.Printf("📡 URL Base: http://localhost:%s/api/v1", cfg.Port)
	log.Printf("=====================================================")

	if err := router.Run(addr); err != nil {
		log.Fatalf("Error al arrancar servidor Go: %v", err)
	}
}
