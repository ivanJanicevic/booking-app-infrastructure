package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"follower-service/db"
	"follower-service/model"

	"github.com/gorilla/mux"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// createFollowerLogic je JEDINA funkcija koja komunicira sa bazom.
// Ona sadrži svu logiku za proveru i kreiranje veze.
func createFollowerLogic(w http.ResponseWriter, followerID int, followedID int) {
	// 1. Proveravamo da li oba korisnika zaista postoje u bazi
	followerExists, err := db.UserExists(followerID)
	if err != nil {
		http.Error(w, "Greška servera pri proveri korisnika (follower): "+err.Error(), http.StatusInternalServerError)
		return
	}
	followedExists, err := db.UserExists(followedID)
	if err != nil {
		http.Error(w, "Greška servera pri proveri korisnika (followed): "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Ako bilo koji od korisnika ne postoji, vraćamo grešku i prekidamo
	if !followerExists {
		http.Error(w, "Korisnik koji prati (follower) ne postoji.", http.StatusNotFound)
		return
	}
	if !followedExists {
		http.Error(w, "Korisnik koji se prati (followed) ne postoji.", http.StatusNotFound)
		return
	}
	
	// 3. Tek ako oba korisnika postoje, krećemo sa upisom u bazu
	ctx := context.Background()
	session := db.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	_, err = session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		// Koristimo MATCH za korisnike (jer smo već proverili da postoje)
		// i MERGE samo za vezu (da sprečimo duplikate).
		query := `
            MATCH (follower:User {id: $followerId})
            MATCH (followed:User {id: $followedId})
            MERGE (follower)-[:FOLLOWS]->(followed)
        `
		params := map[string]any{
			"followerId": followerID,
			"followedId": followedID,
		}

		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}
		
		return result.Consume(ctx)
	})

	if err != nil {
		http.Error(w, "Greška prilikom upisa veze u bazu: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Ako je sve prošlo kako treba, šaljemo uspešan odgovor
	response := model.Follower{
		FollowerID:     followerID,
		FollowedUserID: followedID,
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// CreateFollowerFromJSON samo dekodira JSON i poziva glavnu logiku.
func CreateFollowerFromJSON(w http.ResponseWriter, r *http.Request) {
	var newFollower model.Follower
	err := json.NewDecoder(r.Body).Decode(&newFollower)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	
	// Pozivamo zajedničku, centralizovanu logiku
	createFollowerLogic(w, newFollower.FollowerID, newFollower.FollowedUserID)
}

// CreateFollowerFromParams samo vadi parametre iz URL-a i poziva glavnu logiku.
func CreateFollowerFromParams(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	followedID, err1 := strconv.Atoi(vars["followedId"])
	followerID, err2 := strconv.Atoi(vars["followerId"])

	if err1 != nil || err2 != nil {
		http.Error(w, "ID-jevi moraju biti brojevi.", http.StatusBadRequest)
		return
	}

	// Pozivamo zajedničku, centralizovanu logiku
	createFollowerLogic(w, followerID, followedID)
}