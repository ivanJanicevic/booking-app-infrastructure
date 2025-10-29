package blog

import (
	"encoding/json"
	"net/http"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/blogs", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		switch r.Method {
		case "POST":
			h.createBlog(w, r)
		case "GET":
			h.getBlogs(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/blogs/like", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		switch r.Method {
		case "POST":
			h.AddLike(w, r)
		case "DELETE":
			h.RemoveLike(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/blogs/comment", func(w http.ResponseWriter, r *http.Request) {

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		switch r.Method {
		case "POST":
			h.AddComment(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
}

func (h *Handler) createBlog(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var blog Blog
	if err := json.NewDecoder(r.Body).Decode(&blog); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.service.Create(blog); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(blog)
}

func (h *Handler) getBlogs(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")
	blogs, err := h.service.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(blogs)
}

func (h *Handler) AddLike(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := r.URL.Query().Get("id")
	user := r.URL.Query().Get("user")

	if id == "" || user == "" {
		http.Error(w, "Missing id or user", http.StatusBadRequest)
		return
	}

	if err := h.service.AddLike(id, user); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Blog lajkovan."})
}

func (h *Handler) RemoveLike(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := r.URL.Query().Get("id")
	user := r.URL.Query().Get("user")

	if id == "" || user == "" {
		http.Error(w, "Missing id or user", http.StatusBadRequest)
		return
	}

	if err := h.service.RemoveLike(id, user); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Lajk uklonjen."})
}

func (h *Handler) AddComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing blog id", http.StatusBadRequest)
		return
	}

	var comment Comment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if comment.UserID == "" || comment.Text == "" {
		http.Error(w, "Missing userId or text", http.StatusBadRequest)
		return
	}

	if err := h.service.AddComment(id, comment); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:4200")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}
