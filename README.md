# EstateCRM – Real Estate CRM

A full-stack Real Estate Customer Relationship Management system designed to help administrators and sales employees manage leads, properties, units, and bookings from a single dashboard.

---

## 🚀 Features

### Authentication & Authorization

- JWT-based authentication
- Admin and Sales Employee roles
- Role-based API authorization
- Password encryption using BCrypt
- Sales employees can access only their assigned leads

### Lead Management

- Create leads
- Edit leads
- View leads
- Search leads
- Filter by lead status
- Assign leads to sales employees
- Add notes
- Add follow-up dates
- Delete leads (Admin only)

### Lead Pipeline

The system supports the following lead stages:

- New
- Contacted
- Site Visit
- Interested
- Negotiation
- Booked
- Lost

### Property Management

Properties follow a hierarchy:

Project
→ Building
→ Unit

Administrators can:

- Create projects
- Edit projects
- Delete projects
- Create buildings
- Edit buildings
- Delete buildings
- Create units
- Edit units
- Delete available units
- View unit price and type
- Track unit availability

### Booking Management

- Connect a lead with a property unit
- Create bookings
- View booking history
- Automatically mark the unit as BOOKED
- Automatically mark the lead as BOOKED
- Prevent double-booking
- Prevent a lead from having multiple active bookings
- Sales employees can book only for their assigned leads

### Dashboard

The dashboard provides:

- Total leads
- New leads
- Contacted leads
- Site visits
- Interested leads
- Negotiations
- Booked leads
- Lost leads
- Total units
- Available units
- Booked units
- Total bookings
- Active bookings
- Cancelled bookings

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- React Router
- CSS

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- Maven

### Database

- MySQL 8

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman

---

## 🏗️ Project Structure

```text
crm/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── real_estate/
│   │       │       └── crm/
│   │       │           ├── controller/
│   │       │           ├── dto/
│   │       │           ├── entity/
│   │       │           ├── exception/
│   │       │           ├── repository/
│   │       │           ├── security/
│   │       │           └── service/
│   │       │
│   │       └── resources/
│   │           └── application.properties
│   │
│   ├── pom.xml
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md