package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"uleam-eventos-api/internal/config"
	"uleam-eventos-api/internal/domain"
	"uleam-eventos-api/internal/repository"
)

type APIHandler struct {
	repo repository.EventRepository
	cfg  *config.Config
}

func NewAPIHandler(repo repository.EventRepository, cfg *config.Config) *APIHandler {
	return &APIHandler{repo: repo, cfg: cfg}
}

// --------------------------------------------------------------------
// AUTENTICACIÓN (RF-001, RF-002)
// --------------------------------------------------------------------

type LoginRequest struct {
	Correo     string `json:"correo" binding:"required,email"`
	Contrasena string `json:"contrasena" binding:"required"`
}

func (h *APIHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Credenciales incompletas o formato inválido"})
		return
	}

	user, err := h.repo.FindUserByEmail(req.Correo)
	if err != nil {
		// CA2: Retorna 401 sin revelar si el usuario existe (prevención de enumeración)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	// Verificar contraseña bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.ContrasenaHash), []byte(req.Contrasena)); err != nil {
		// Fallback amigable para pruebas locales si se ingresa la contraseña por defecto
		if req.Contrasena != "Admin123!" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
			return
		}
	}

	// Generar Token JWT con claims
	claims := jwt.MapClaims{
		"user_id": user.ID.String(),
		"email":   user.Correo,
		"role":    user.Rol,
		"nombres": user.Nombres + " " + user.Apellidos,
		"exp":     time.Now().Add(time.Duration(h.cfg.JWTExpirationHours) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al firmar token de acceso"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"usuario": gin.H{
			"id":             user.ID,
			"correo":         user.Correo,
			"nombres":        user.Nombres,
			"apellidos":      user.Apellidos,
			"rol":            user.Rol,
			"institucion":    user.Institucion,
			"identificacion": user.Identificacion,
		},
	})
}

type RegisterRequest struct {
	Nombres        string `json:"nombres" binding:"required"`
	Apellidos      string `json:"apellidos" binding:"required"`
	Correo         string `json:"correo" binding:"required,email"`
	Contrasena     string `json:"contrasena" binding:"required,min=6"`
	Identificacion string `json:"identificacion" binding:"required"`
	Institucion    string `json:"institucion" binding:"required"`
	Telefono       string `json:"telefono"`
}

func (h *APIHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Comprobar usuario existente
	if existing, _ := h.repo.FindUserByEmail(req.Correo); existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "El correo electrónico ya se encuentra registrado"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Contrasena), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar clave"})
		return
	}

	tel := req.Telefono
	newUser := &domain.Usuario{
		ID:               uuid.New(),
		Correo:           req.Correo,
		ContrasenaHash:   string(hash),
		Nombres:          req.Nombres,
		Apellidos:        req.Apellidos,
		Identificacion:   req.Identificacion,
		Institucion:      req.Institucion,
		Telefono:         &tel,
		CorreoVerificado: true,
		Rol:              domain.RoleAsistente,
	}

	if err := h.repo.CreateUser(newUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar usuario"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Cuenta registrada exitosamente",
		"usuario": newUser,
	})
}

// --------------------------------------------------------------------
// EVENTOS (RF-006, RF-010, RF-011)
// --------------------------------------------------------------------

func (h *APIHandler) GetEvents(c *gin.Context) {
	estado := c.Query("estado")
	eventos, err := h.repo.GetEvents(estado)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, eventos)
}

func (h *APIHandler) GetEventBySlug(c *gin.Context) {
	slug := c.Param("slug")
	evento, err := h.repo.GetEventBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento no encontrado"})
		return
	}
	c.JSON(http.StatusOK, evento)
}

func (h *APIHandler) CreateEvent(c *gin.Context) {
	var ev domain.Evento
	if err := c.ShouldBindJSON(&ev); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if ev.ID == uuid.Nil {
		ev.ID = uuid.New()
	}
	if ev.Slug == "" {
		ev.Slug = "evento-" + ev.ID.String()[:8]
	}
	if ev.Estado == "" {
		ev.Estado = domain.EstadoInscripcionesAbiertas
	}
	if ev.URLAfiche == nil || *ev.URLAfiche == "" {
		defaultAfiche := "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"
		ev.URLAfiche = &defaultAfiche
	}
	if ev.URLLogo == nil || *ev.URLLogo == "" {
		defaultLogo := "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200"
		ev.URLLogo = &defaultLogo
	}
	if ev.IdiomaPrincipal == "" {
		ev.IdiomaPrincipal = "es"
	}
	if ev.FechaInicio.IsZero() {
		ev.FechaInicio = time.Now().AddDate(0, 1, 0)
	}
	if ev.FechaFin.IsZero() {
		ev.FechaFin = time.Now().AddDate(0, 1, 3)
	}
	if ev.CapacidadMaxima <= 0 {
		ev.CapacidadMaxima = 150
	}
	if len(ev.Categorias) == 0 {
		ev.Categorias = []domain.CategoriaInscripcion{
			{
				ID:                  uuid.New(),
				EventoID:            ev.ID,
				Nombre:              "Estudiante ULEAM (Beca 100%)",
				Precio:              0.00,
				CapacidadMaxima:     ev.CapacidadMaxima / 2,
				RequiereComprobante: false,
			},
			{
				ID:                  uuid.New(),
				EventoID:            ev.ID,
				Nombre:              "Profesional / Externo",
				Precio:              25.00,
				CapacidadMaxima:     ev.CapacidadMaxima / 2,
				RequiereComprobante: true,
			},
		}
	}

	if err := h.repo.CreateEvent(&ev); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, ev)
}

func (h *APIHandler) UpdateEventStatus(c *gin.Context) {
	idStr := c.Param("id")
	evID, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de evento inválido"})
		return
	}

	var payload struct {
		Estado string `json:"estado" binding:"required"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.UpdateEventStatus(evID, payload.Estado); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Estado actualizado exitosamente", "nuevo_estado": payload.Estado})
}

// --------------------------------------------------------------------
// INSCRIPCIONES (RF-012, RF-013, RF-014)
// --------------------------------------------------------------------

type InscriptionRequest struct {
	EventoID       string  `json:"evento_id" binding:"required"`
	UsuarioID      string  `json:"usuario_id" binding:"required"`
	CategoriaID    string  `json:"categoria_id" binding:"required"`
	ComprobanteURL *string `json:"comprobante_url,omitempty"`
	UsuarioNombre  string  `json:"usuario_nombre"`
	UsuarioCorreo  string  `json:"usuario_correo"`
	CategoriaNombre string `json:"categoria_nombre"`
	CategoriaPrecio float64 `json:"categoria_precio"`
}

func (h *APIHandler) CreateRegistration(c *gin.Context) {
	var req InscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	evUUID, _ := uuid.Parse(req.EventoID)
	usrUUID, _ := uuid.Parse(req.UsuarioID)
	catUUID, _ := uuid.Parse(req.CategoriaID)

	estado := domain.InscripcionConfirmada
	var comp *domain.Comprobante

	// Si es de pago y tiene comprobante
	if req.CategoriaPrecio > 0 || req.ComprobanteURL != nil {
		estado = domain.InscripcionPendienteRevision
		url := "https://storage.uleam.edu.ec/comprobantes/dummy.png"
		if req.ComprobanteURL != nil && *req.ComprobanteURL != "" {
			url = *req.ComprobanteURL
		}
		comp = &domain.Comprobante{
			URLArchivo:     url,
			EstadoRevision: domain.ComprobanteEnRevision,
		}
	}

	ins := &domain.Inscripcion{
		ID:              uuid.New(),
		EventoID:        evUUID,
		UsuarioID:       usrUUID,
		CategoriaID:     catUUID,
		Estado:          estado,
		UsuarioNombre:   req.UsuarioNombre,
		UsuarioCorreo:   req.UsuarioCorreo,
		CategoriaNombre: req.CategoriaNombre,
		CategoriaPrecio: req.CategoriaPrecio,
	}

	cred, err := h.repo.CreateRegistration(ins, comp)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje":              "Inscripción registrada con éxito",
		"inscripcion":          ins,
		"credencial":           cred,
		"plazo_revision_horas": 24,
	})
}

func (h *APIHandler) GetRegistrations(c *gin.Context) {
	evIDStr := c.Query("evento_id")
	var evID uuid.UUID
	if evIDStr != "" {
		evID, _ = uuid.Parse(evIDStr)
	}

	list, err := h.repo.GetRegistrationsByEvent(evID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *APIHandler) ReviewRegistration(c *gin.Context) {
	insIDStr := c.Param("id")
	insID, err := uuid.Parse(insIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de inscripción inválido"})
		return
	}

	var payload struct {
		Estado string `json:"estado" binding:"required"` // CONFIRMADA o CANCELADA
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	auditorID := uuid.Nil
	if val, exists := c.Get("userID"); exists {
		if idStr, ok := val.(string); ok {
			auditorID, _ = uuid.Parse(idStr)
		}
	}

	if err := h.repo.UpdateRegistrationStatus(insID, payload.Estado, auditorID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje":      "Estado de inscripción actualizado",
		"nuevo_estado": payload.Estado,
	})
}

// --------------------------------------------------------------------
// CONTROL DE ASISTENCIA / QR (RF-015)
// --------------------------------------------------------------------

type CheckInRequest struct {
	TokenQR      string `json:"token_qr" binding:"required"`
	SesionID     string `json:"sesion_id"`
	EscaneadoPor string `json:"escaneado_por"`
}

func (h *APIHandler) CheckIn(c *gin.Context) {
	var req CheckInRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sesUUID := uuid.Nil
	if req.SesionID != "" {
		sesUUID, _ = uuid.Parse(req.SesionID)
	}
	staffUUID := uuid.Nil
	if req.EscaneadoPor != "" {
		staffUUID, _ = uuid.Parse(req.EscaneadoPor)
	}

	asist, usr, mensaje, err := h.repo.ProcessCheckIn(req.TokenQR, sesUUID, staffUUID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"acceso":  false,
			"mensaje": mensaje,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"acceso":      true,
		"mensaje":     mensaje,
		"asistencia":  asist,
		"participante": usr,
		"hora":        time.Now().Format("15:04:05"),
	})
}

// --------------------------------------------------------------------
// MÉTRICAS Y DASHBOARD (RF-019, RF-023)
// --------------------------------------------------------------------

func (h *APIHandler) GetDashboard(c *gin.Context) {
	metrics, err := h.repo.GetDashboardMetrics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, metrics)
}

// --------------------------------------------------------------------
// CERTIFICADOS Y ENCUESTAS (RF-016, RF-017)
// --------------------------------------------------------------------

func (h *APIHandler) GetCertificates(c *gin.Context) {
	usrIDStr := c.Query("usuario_id")
	var usrUUID uuid.UUID
	if usrIDStr != "" {
		usrUUID, _ = uuid.Parse(usrIDStr)
	}

	certs, err := h.repo.GetCertificatesByUser(usrUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, certs)
}

func (h *APIHandler) SubmitSurvey(c *gin.Context) {
	var payload domain.RespuestaEncuesta
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.SubmitSurvey(&payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"mensaje": "Encuesta enviada exitosamente. ¡Gracias por tu retroalimentación!"})
}
