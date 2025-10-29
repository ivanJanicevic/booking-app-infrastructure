# SOA Microservices Project

Microservices-based system with an **Angular frontend**, **Java/Go backend services**, an **API Gateway**, a **Service Registry**, and a **full monitoring stack**.  
Each domain runs as an independent service and communicates over **HTTP/gRPC**.

---

## Project Overview

- **Frontend:** Angular  
- **Backend microservices:** Java Spring Boot, Go  
- **API Gateway & Service Registry:** Routing & discovery  
- **Databases:** Separate PostgreSQL databases for `tours` and `stakeholders`  
- **Monitoring:** Prometheus, Grafana, Loki, Jaeger  

---

## Services

| Service | Description | Technologies / Databases |
|----------|--------------|--------------------------|
| **API Gateway** (`api-gateway1`) | Entry point, routing to backend services | Spring Cloud Gateway |
| **Frontend** (`frontend-soa`) | Angular web app | Angular, TypeScript |
| **Service Registry** (`service-registry`) | Service discovery | Eureka (Spring Boot) |
| **Stakeholders** (`service-stakeholders`) | Users/auth management, gRPC server | Java, PostgreSQL, gRPC |
| **Tours** (`service-tours`) | Tours domain, communicates with stakeholders | Java, PostgreSQL, gRPC |
| **Blog** (`service-blog`) | Blog/content management | Go, MongoDB |
| **Follower** (`service-follower`) | Social graph / follower relationships | Go, Neo4j |
| **Monitoring** (`monitoring`) | Observability stack | Prometheus, Grafana, Loki, Jaeger, cAdvisor, Node Exporter |

---

## Docker Compose

Start core services:

```bash
docker-compose -f docker-compose-microservices.yml up -d
