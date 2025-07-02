# 🏨 Hotel Booking System – Microservices Project

This project is a full-featured **Hotel Booking System** built using a **microservices architecture**. It supports user authentication, hotel and room management, intelligent search, booking functionality, real-time admin notifications, and AI-assisted user interaction.

All services are containerized and orchestrated with **Docker Compose**, making the system modular, scalable, and easy to maintain.

---

## 📺 Project Demo

Watch the project demo on YouTube:  
👉 [https://youtu.be/tr3WVyPP9IY](https://youtu.be/tr3WVyPP9IY)


## 📌 Project Overview

### 🧱 Microservices

| Service                | Description |
|------------------------|-------------|
| **AuthService**        | Handles user registration, login, and role-based access (Client/Admin). Uses PostgreSQL. |
| **BookHotelService**   | Manages hotel bookings. Validates room availability and guest capacity. Emits reservation events through RabbitMQ. |
| **Gateway**            | API Gateway using Ocelot. Routes all requests to respective services. Includes AI Agent integration. |
| **HotelAdminService**  | Allows admins to manage hotels and rooms. Uses PostgreSQL for data and Redis for caching hotel details. |
| **HotelCommentService**| Stores and retrieves user comments about hotels. Uses MongoDB. |
| **HotelSearchService** | Searches for available hotels based on criteria. Utilizes Redis for fast lookups. |
| **NotificationService**| Sends admin alerts when hotel capacity drops below 20% or a new booking is made. Runs scheduled tasks. |

---

## 🔍 Key Features

### 👤 **Authentication**
- Users can **register or log in**
- Role-based access: `Client` vs `Admin`
- JWT-based authentication

### 🏨 **Hotel Management (Admin)**
- Admins can:
  - Create/update hotels and rooms
  - View capacity reports
- Redis caching is used to optimize hotel detail retrieval

### 🔎 **Hotel Search (Client)**
- Users can search hotels by:
  - Destination
  - Check-in/check-out dates
  - Number of guests
- Results only include **vacant rooms**

### 🛏️ **Room Booking**
- Clients can:
  - Select an available room
  - Book it for a defined date range
- Validations:
  - No overlapping bookings
  - Room capacity check
- Reservation event is published to RabbitMQ

### 💬 **Hotel Comments**
- Clients can:
  - Submit comments after booking
  - View existing hotel reviews
- Stored in MongoDB as flexible documents

### 🔔 **Notifications (Admin)**
- Runs a **nightly task** to:
  - Check hotel capacity (if < 20%, notify admin)
- Sends admin alerts for **new bookings**

### 🤖 **AI Agent**
- Natural language interface integrated into the frontend
- Handles:
  - Hotel **search** (e.g., “Find hotels in Rome for 2 people”)
  - **Booking** (e.g., “Book a room at SeaView Hotel from Aug 1 to Aug 5”)
- Uses OpenAI API and intent routing logic to determine action

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | .NET 8, C# |
| Frontend | React (external) |
| Database | PostgreSQL, MongoDB |
| Caching | Redis |
| Messaging | RabbitMQ |
| Gateway | Ocelot |
| Containerization | Docker, Docker Compose |
| AI Integration | OpenAI API |

---
