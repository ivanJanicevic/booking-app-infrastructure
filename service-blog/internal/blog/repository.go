package blog

import (
	"log"
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	 "go.mongodb.org/mongo-driver/bson/primitive"

)

type Repository struct {
	collection *mongo.Collection
}

func NewRepository(db *mongo.Database) *Repository {
	return &Repository{
		collection: db.Collection("blogs"),
	}
}

func (r *Repository) Create(blog Blog) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, blog)
	return err
}

func (r *Repository) GetAll() ([]Blog, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []Blog
	if err := cursor.All(ctx, &blogs); err != nil {
		return nil, err
	}
	return blogs, nil
}

func (r *Repository) AddLike(blogID, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(blogID)
	if err != nil {
		return err
	}

	update := bson.M{"$addToSet": bson.M{"likes": userID}}
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	return err
}

func (r *Repository) RemoveLike(blogID, userID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(blogID)
	if err != nil {
		return err
	}

	update := bson.M{"$pull": bson.M{"likes": userID}}
	result, err := r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return err
	}

	if result.MatchedCount == 0 {
		log.Println("⚠️  Nije pronađen blog sa tim ID-jem")
	}
	if result.ModifiedCount == 0 {
		log.Println("⚠️  Blog pronađen, ali lajk nije uklonjen (možda nije postojao?)")
	}

	return nil
}
func (r *Repository) AddComment(blogID string, comment Comment) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(blogID)
	if err != nil {
		return err
	}

	update := bson.M{"$push": bson.M{"comments": comment}}
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	return err
}

