# AutoCare Scheduler API

## Overview

AutoCare Scheduler is a RESTful API designed to manage a small auto service shop. It provides endpoints to handle customers, vehicles, service types, and appointments, allowing efficient tracking of scheduled maintenance and services.

This project is being developed as a learning initiative to strengthen backend development skills using **Spring Boot**, **Java**, **MySQL**, **Hibernate**, and **RESTful API principles**. The focus is on implementing proper data modeling, validation, and service orchestration.

---

## Current Features

The API currently supports:

- **Customers**
  - Create, read, update, and list customers.
- **Vehicles**
  - Associate vehicles with customers.
  - CRUD operations for vehicles.
- **Service Types**
  - Define types of services offered (e.g., Oil Change, Tire Rotation) with pricing.
- **Appointments**
  - Schedule services for vehicles.
  - View all appointments.
  - Basic validation on required fields.

---

## Future Enhancements

Planned improvements include:

- Update and cancel appointments.
- Filter appointments by customer, vehicle, service type, date, and status.
- Implement status tracking for appointments (Pending, Completed, Cancelled).
- Validate scheduling conflicts to prevent overlapping appointments.
- Generate reports for completed services and revenue.
- Implement authentication and role-based access with Spring Security.
- Improve API responses with standardized DTOs for all endpoints.
- Optional: dashboard interface for shop staff to visualize schedules and services.

---

## Technology Stack

- **Java 17**
- **Spring Boot 3**
- **Spring Data JPA / Hibernate**
- **MySQL**
- **Lombok**
- **Postman** (for API testing)

---

## Docker

The project can be started with Docker Compose from the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:4200
- Backend: http://localhost:8080/api
- MySQL: localhost:3307
