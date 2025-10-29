package main

import (
	"log"
	"net/http"
	"time"

	"follower-service/consumer"
	"follower-service/db"
	"follower-service/handler"
	"github.com/gorilla/mux"
	"github.com/hudl/fargo"
)

func registerWithEureka() {
	instance := &fargo.Instance{
		HostName:         "localhost", 
		App:              "FOLLOWER-SERVICE", 
		IPAddr:           "127.0.0.1",
		Port:             8082,
		PortEnabled:      true,
		VipAddress:       "follower-service",
		SecureVipAddress: "follower-service",
		Status:           fargo.UP,
		DataCenterInfo:   fargo.DataCenterInfo{Name: fargo.MyOwn},
		LeaseInfo: fargo.LeaseInfo{
			RenewalIntervalInSecs: 30, 
			DurationInSecs:        90, 
		},
	}

	eurekaConn := fargo.NewConn("http://localhost:8761/eureka")
	
	err := eurekaConn.RegisterInstance(instance)
	if err != nil {
		log.Fatalf("Greška prilikom registracije na Eureku: %s", err)
	}
	log.Println("Uspešno registrovan na Eureku kao FOLLOWER-SERVICE")

	go func() {
		for {
			err := eurekaConn.HeartBeatInstance(instance)
			if err != nil {
				log.Printf("Greška prilikom slanja heartbeata: %s", err)
				err = eurekaConn.RegisterInstance(instance)
				if err != nil {
					log.Printf("Greška prilikom ponovne registracije: %s", err)
				}
			}
			time.Sleep(time.Duration(instance.LeaseInfo.RenewalIntervalInSecs) * time.Second)
		}
	}()
}

func main() {
	registerWithEureka()

	go consumer.StartConsumer()

	db.InitDB()
	defer db.CloseDB()

	r := mux.NewRouter()

	r.HandleFunc("/followers", handler.CreateFollowerFromJSON).Methods("POST")
	r.HandleFunc("/follow/{followedId}/{followerId}", handler.CreateFollowerFromParams).Methods("POST")

	port := ":8082"
	log.Println("Server se pokreće na portu", port)
	log.Fatal(http.ListenAndServe(port, r))
}