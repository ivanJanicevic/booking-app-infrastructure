package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/hudl/fargo"
	"github.com/joho/godotenv"

	"blog-service/internal/blog"
	"blog-service/pkg/db"
)

func registerWithEureka() {
	instance := &fargo.Instance{
		HostName:         "localhost",
		App:              "BLOG-SERVICE",
		IPAddr:           "127.0.0.1",
		Port:             8088,
		PortEnabled:      true,
		VipAddress:       "blog-service",
		SecureVipAddress: "blog-service",
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
	log.Println("Uspešno registrovan na Eureku kao BLOG-SERVICE")
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

	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Greška pri učitavanju .env fajla")
	}

	registerWithEureka()

	mongoURI := os.Getenv("MONGO_URI")
	client := db.ConnectMongo(mongoURI)
	database := client.Database("blogDB")

	repo := blog.NewRepository(database)
	service := blog.NewService(repo)
	handler := blog.NewHandler(service)

	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	log.Println("✅ Blog servis pokrenut na http://localhost:8088")

	log.Fatal(http.ListenAndServe(":8088", mux))
}
