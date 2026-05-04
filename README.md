# 🎓 Mindtag - Real-Time University Attendance System

<div align="center">
  <img src="./Mindtag.png" alt="Mindtag Cover" width="800" />
  <p><em>A secure, automated attendance tracking platform using dynamic QR codes and geo-fencing for academic integrity.</em></p>
</div>

---

## 📌 Overview
**Mindtag** solves the manual university attendance problem by providing a seamless, real-time, and highly secure QR-based scanning system. It eliminates cheating, ghost-attendance, and manual errors while providing comprehensive dashboards for both professors and university administration.

## ✨ Key Features
*   **🔄 Dynamic QR Rotation:** The attendance QR code rotates every 5 seconds (driven by background jobs) to prevent students from sharing photos of the code.
*   **📍 Geo-Fencing & GPS Validation:** Students can only record attendance if their GPS coordinates match the lecture hall's location within an acceptable radius.
*   **📱 Device Binding:** Accounts are strictly bound to a single mobile device to prevent credential sharing.
*   **🕵️‍♂️ Anti-Spoofing & Anomaly Detection:** The system detects rapid location changes (speed anomalies) between consecutive scans to flag suspicious behavior.
*   **🔐 Highly Secure Architecture:** Implements robust JWT authentication, rotating refresh tokens, and strict Audit Logging for every sensitive action.

## 🛠️ Technology Stack
### Backend
*   **.NET 8 (ASP.NET Core Web API):** Core backend framework.
*   **Entity Framework Core:** Code-first ORM.
*   **SQL Server:** Primary relational database.
*   **Redis:** In-memory caching for ultra-fast QR payload validation and rate limiting.
*   **SignalR:** Real-time WebSocket communication for pushing new QR codes to the professor's dashboard.
*   **Hangfire:** Background job processing (QR rotation, auto-ending sessions, reminders).

### Frontend (Mobile & Web)
*   **React Native / Expo:** Cross-platform mobile application for students.
*   **React.js / Vite:** Web dashboard for professors and administrators.

## 🏗️ System Architecture & Structure
The project follows a **Clean Architecture** pattern, ensuring scalability and maintainability by separating concerns into distinct layers.

```text
Mindtag/
├── 📁 backend/                        # .NET 8 ASP.NET Core Backend
│   ├── 📁 Mindtag.API/                # Presentation: API Controllers, Middleware, SignalR Hubs
│   ├── 📁 Mindtag.Core/               # Domain: Entities, Enums, Interfaces, DTOs
│   └── 📁 Mindtag.Infrastructure/     # Persistence: EF Core DbContext, Repositories, Services, Jobs
├── 📁 frontend/                       # React Native Mobile Application
│   ├── 📁 app/                        # Expo Router Screens & Navigation
│   ├── 📁 components/                 # Reusable UI Components
│   ├── 📁 constants/                  # Theme Colors & Typography
│   └── 📁 hooks/                      # Custom React Hooks for API calls
├── 📄 .gitignore                      # Git ignored files
└── 📄 README.md                       # Project documentation
```

## 🚀 Getting Started

### Prerequisites
*   .NET 8 SDK
*   SQL Server
*   Redis (Local or Docker)
*   Node.js (for frontend applications)

### Running the Backend
1. Clone the repository.
2. Navigate to the backend folder: `cd backend/Mindtag.API`
3. Update the `appsettings.json` with your SQL Server and Redis connection strings.
4. Run the application (EF Core migrations will apply automatically on the first run):
   ```bash
   dotnet run
   ```

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
