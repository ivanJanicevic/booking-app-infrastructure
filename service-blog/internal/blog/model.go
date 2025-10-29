package blog

import "time"

type Blog struct {
	ID          string    `json:"id" bson:"_id,omitempty"`
	Author      string    `json:"author" bson:"author"`
	Title       string    `json:"title" bson:"title"`
	Description string    `json:"description" bson:"description"`
	CreatedAt   time.Time `json:"createdAt" bson:"createdAt"`
	Likes       []string  `json:"likes,omitempty" bson:"likes,omitempty"`
	Comments    []Comment `json:"comments,omitempty" bson:"comments,omitempty"`
	Images      []string  `json:"images,omitempty" bson:"images,omitempty"`
}

type Comment struct {
	UserID     string    `json:"userId" bson:"userId"`
	Text       string    `json:"text" bson:"text"`
	CreatedAt  time.Time `json:"createdAt" bson:"createdAt"`
	ModifiedAt time.Time `json:"modifiedAt" bson:"modifiedAt"`
}
