package blog

import (
	"time"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/html"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(blog Blog) error {
	blog.CreatedAt = time.Now()

	renderer := html.NewRenderer(html.RendererOptions{
		Flags: html.CommonFlags,
	})
	mdHTML := markdown.ToHTML([]byte(blog.Description), nil, renderer)
	blog.Description = string(mdHTML)

	return s.repo.Create(blog)
}

func (s *Service) GetAll() ([]Blog, error) {
	return s.repo.GetAll()
}

func (s *Service) AddLike(blogID, userID string) error {
	return s.repo.AddLike(blogID, userID)
}

func (s *Service) RemoveLike(blogID, userID string) error {
	return s.repo.RemoveLike(blogID, userID)
}

func (s *Service) AddComment(blogID string, comment Comment) error {
	comment.CreatedAt = time.Now()
	comment.ModifiedAt = time.Now()
	return s.repo.AddComment(blogID, comment)
}
