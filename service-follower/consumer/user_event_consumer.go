package consumer

import (
	"log"
	"strconv"

	
	"follower-service/db" 
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	exchangeName = "user-events-exchange"
	exchangeType = "fanout"
	queueName    = "followers-user-events-queue" 
)

type UserEventDTO struct {
	UserID int64 `json:"userId"`
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func StartConsumer() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	failOnError(err, "Neuspešna konekcija na RabbitMQ")
	defer conn.Close()
	log.Println("Uspešno konektovan na RabbitMQ")

	ch, err := conn.Channel()
	failOnError(err, "Neuspešno otvaranje kanala")
	defer ch.Close()

	err = ch.ExchangeDeclare(
		exchangeName, // Ime
		exchangeType, // Tip
		true,         // durable
		false,        // auto-deleted
		false,        // internal
		false,        // no-wait
		nil,          // arguments
	)
	failOnError(err, "Neuspešno deklarisanje exchange-a")

	q, err := ch.QueueDeclare(
		queueName, // Ime reda
		true,      // durable (red će preživeti restart RabbitMQ-a)
		false,     // delete when unused
		false,     // exclusive
		false,     // no-wait
		nil,       // arguments
	)
	failOnError(err, "Neuspešno deklarisanje reda")

	err = ch.QueueBind(
		q.Name,       
		"",           
		exchangeName, 
		false,
		nil,
	)
	failOnError(err, "Neuspešno povezivanje reda sa exchange-om")


	msgs, err := ch.Consume(
		q.Name, 
		"",     
		false,  
		false,  
		false,  
		false,  
		nil,    
	)
	failOnError(err, "Neuspešna registracija potrošača")

	var forever chan struct{}

	go func() {
		for d := range msgs {
			log.Printf("Primljena poruka sa routing key: %s", d.RoutingKey)

			userIdStr := string(d.Body)
			userId, err := strconv.ParseInt(userIdStr, 10, 64)
			if err != nil {
				log.Printf("Greška pri konverziji ID-a '%s' u broj: %s", userIdStr, err)
				d.Nack(false, false) 
				continue
			}

			switch d.RoutingKey {
			case "user.created":
				log.Printf("Kreiranje čvora za korisnika sa ID: %d", userId)
				err = db.CreateUserNode(userId) 
				if err != nil {
					log.Printf("Greška pri kreiranju čvora: %s", err)
				}

			case "user.deleted":
				log.Printf("Brisanje čvora za korisnika sa ID: %d", userId)
				err = db.DeleteUserNode(userId) 
				if err != nil {
					log.Printf("Greška pri brisanju čvora: %s", err)
				}
			default:
				log.Printf("Nepoznat routing key: %s", d.RoutingKey)
			}
			
			d.Ack(false)
		}
	}()

	log.Printf(" [*] Čekanje na poruke. Za izlaz pritisnite CTRL+C")
	<-forever 
}