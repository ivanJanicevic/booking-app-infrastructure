// db/database.go
package db

import (
	"context"
	"log"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

var Driver neo4j.DriverWithContext

func InitDB() {
	uri := "neo4j://localhost:7687"
	user := "neo4j"
	pass := "password"
	
	var err error
	Driver, err = neo4j.NewDriverWithContext(uri, neo4j.BasicAuth(user, pass, ""))
	if err != nil {
		log.Fatalf("Nije moguće kreirati drajver za Neo4j: %v", err)
	}

	err = Driver.VerifyConnectivity(context.Background())
	if err != nil {
		log.Fatalf("Greška prilikom spajanja na Neo4j: %v", err)
	}

	log.Println("Uspješno spojen na Neo4j bazu.")
}

func CloseDB() {
	if Driver != nil {
		Driver.Close(context.Background())
	}
}

func UserExists(userId int) (bool, error) {
	ctx := context.Background()
	session := Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
		query := "MATCH (u:User {id: $userId}) RETURN count(u) > 0 AS userExists"
		params := map[string]interface{}{"userId": userId}
		
		res, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}
		
		record, err := res.Single(ctx)
		if err != nil {
			return false, err
		}
		
		exists, _ := record.Get("userExists")
		return exists.(bool), nil
	})
	
	if err != nil {
		log.Printf("Greška pri proveri postojanja korisnika sa ID %d: %v", userId, err)
		return false, err
	}
	
	return result.(bool), nil
}

func CreateUserNode(userId int64) error {
	
	ctx := context.Background()
	session := Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	query := "MERGE (u:User {id: $userId})"
	params := map[string]interface{}{"userId": userId}

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}
		return result.Consume(ctx)
	})

	if err != nil {
		log.Printf("Greška pri izvršavanju MERGE upita za userId %d: %v", userId, err)
	}

	return err
}


func DeleteUserNode(userId int64) error {
	ctx := context.Background()
	session := Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeWrite})
	defer session.Close(ctx)

	query := "MATCH (u:User {id: $userId}) DETACH DELETE u"
	params := map[string]interface{}{"userId": userId}

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (interface{}, error) {
		result, err := tx.Run(ctx, query, params)
		if err != nil {
			return nil, err
		}
		return result.Consume(ctx)
	})
	
	if err != nil {
		log.Printf("Greška pri izvršavanju DETACH DELETE upita za userId %d: %v", userId, err)
	}

	return err
}