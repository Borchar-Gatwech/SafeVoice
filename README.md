# 💜 SafeVoice: Beyond a Safe Voice. A Safe Space.

[](https://www.google.com/search?q=https://github.com/your-repo/safevoice/stargazers)

## 🌟 Overview

**Safe Voice** is not just a reporting application; it is a **Safe Space** or **Safe Circle** built to provide trauma-informed support. It is designed to allow users to submit **anonymous incident reports** and then, critically, connect them with real peer support.

This project utilizes a modern **React/Vite** frontend and a dedicated **Express backend** which also serves a specialized **Infrastructure as a Service (IaaS) API layer** for broader safety integration.

## ✨ Core Features & Safe Voice Ecosystem

The Safe Voice platform delivers layered support far beyond basic incident logging:

### 1\. **AI Peer Support & Safe Circles**

  * **Anonymous Reporting**: Users submit reports completely anonymously.
  * **AI Matching Algorithm**: Reports are processed by an intelligent AI that matches the user to other real people who have gone through a similar incident.
  * **Peer Support Circles**: Matched users are invited to join a **"Safe Circle"** with real-time chat functionality to receive genuine peer support.

### 2\. **Dual Support Pathway**

  * **Chatbot Option**: If the victim chooses not to join a peer support circle, they can engage with a specialized **chatbot** for immediate informational and emotional support.

### 3\. **African Contextualized Resources**

  * The platform is pre-seeded with verified, location-based resources for **7 African countries**, ensuring relevant and actionable help is easily accessible.

### 4\. **Infrastructure as a Service (IaaS) API**

  * We offer the core AI Matching and Reporting capabilities via a robust **API Layer** to external developers.
  * **IaaS Offering**: Other apps or systems can integrate our safety infrastructure directly.
  * **Monetization**: This API is offered with a **Freemium tier, Monthly tier, and Annually** subscription model.

## 📐 System Architecture & Development (IaaS Focus)

The architecture is designed for scalability and separation, isolating the core business logic from the presentation layer and IaaS layer.

| Component | Technology | Responsibility |
| :--- | :--- | :--- |
| **Client** | React, Vite, Tailwind CSS | Modern UI for **User Reporting** and **Admin Access**. |
| **Server** | Express.js, MongoDB, Mongoose | **Report Management**, **IaaS API Gateway**, **Admin Authentication**. |
| **Service Layer** (within Server) | Custom Logic | **AI Peer Matching Algorithm**, **Resource Filtering**, **Anonymous ID Generation**. |

## 🚀 Quick Start

Your project uses a standard full-stack setup. Please ensure you have met the prerequisites before proceeding.

### Prerequisites

  * Node.js (v14 or higher)
  * npm or yarn
  * MongoDB instance (local or Atlas)

### 1\. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and configure for both the application and Admin/API security:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000

# ADMIN/API SECURITY
ADMIN_USER=admin
ADMIN_PASS=safe1234
JWT_SECRET=some_long_random_secret
# Note: For production, use secure, random values for all secrets.
```

Start the development server:

```bash
npm run dev
```

The **API/IaaS endpoints** will be available at `http://localhost:5000`

### 2\. Frontend Setup

In a new terminal, navigate to the client directory:

```bash
cd client
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or another port).

-----

## 💻 API Endpoints

The server exposes two layers of APIs: The standard application API and the IaaS API (which uses a similar structure but requires API Key authentication in production).

### Application API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/reports` | **Core Feature**: Create an anonymous report and trigger AI Peer Matching. |
| GET    | `/api/reports` | Retrieve all reports (**Admin-only access**). |

### IaaS Developer API Endpoints (IaaS clients)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/iaas/report` | Submit a report via IaaS layer (requires API Key validation). |
| GET    | `/api/iaas/resources` | Retrieve location-based, filterable African resources (requires API Key validation). |

### Example Request (Creating a Core Report)

```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Safety Issue",
    "description": "Description of the incident",
    "location": "Building A",
    "country_code": "NG"
  }'
```

-----

## 🛠️ Tech Stack & Architecture

### Frontend

  - **React 18** & **Vite**: Modern, fast development environment.
  - **Tailwind CSS**: Utility-first CSS framework for rapid styling.
  - **React Router DOM**

### Backend (Server)

  - **Express.js**: Robust backend framework.
  - **MongoDB with Mongoose**: Scalable, flexible database for reports and resources.
  - **CORS enabled**
  - **Architecture**: Proper separation of **models/controllers/services** for clarity and scalability.

### Security and Infrastructure

  - **API keys** and **Rate Limiting** are implemented on the IaaS layer.
  - **Anonymous IDs** are used throughout the system for user privacy.
  - **JWT-based admin authentication** (for `GET /api/reports`).

-----

## 🔒 Admin Access

The project includes a simple JWT-based admin authentication to protect the reports listing and review actions.

  * Set `ADMIN_USER`, `ADMIN_PASS`, and `JWT_SECRET` in `server/.env`.
  * Access the Admin UI from the frontend by clicking the **Admin** button.
  * The frontend stores the token in `localStorage` as `admin_token`.

> **Note**: For production, replace `JWT_SECRET` with a secure random value and consider using a proper user store and hashed passwords. This implementation is intentionally minimal for development.

-----

## 📄 License

MIT

## ❓ Support

For issues or questions, please open an issue in the repository.
