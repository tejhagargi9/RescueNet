# 🌐 RescueNet – Disaster Preparedness and Response System

RescueNet is a web-based platform built with the MERN stack to help communities prepare for and respond to natural disasters. It connects local authorities, citizens, volunteers, and guests for efficient coordination of resources, reporting, and rescue efforts — with offline capability via PWA.

---

## 🚀 Features

* 🆘 **Disaster Reporting:** Citizens can report incidents with location and details.
* 👤 **Guest Access:** Visitors can browse safety tips, view alerts, and access public disaster information without signing in.
* 🧑‍🤝‍🧑 **Role-Based Access:** Separate dashboards for Admin (Local Authorities), Citizens, Volunteers, and Guests.
* 📦 **Resource Management:** Admins can track and allocate supplies like food, water, and medicine.
* 🔄 **Need Matching:** Citizens can request help; volunteers get notified and assigned.
* 🖥️ **Admin Panel:** A comprehensive control panel for admins to manage users, resources, alerts, and analytics.
* 📡 **Offline Support:** Collect and sync data when internet is restored (PWA-based).
* 🔔 **Alerts and Notifications:** Send real-time warnings or status updates.

---

## 👥 User Roles

1. **Admin (Local Authority)**

   * Access full **Admin Panel** with user and resource management
   * Create and manage disaster alerts
   * Assign tasks to volunteers
   * Monitor resources, requests, and analytics

2. **Citizen**

   * Report emergencies
   * Request help or resources
   * View safety tips and alerts

3. **Volunteer**

   * View assigned tasks
   * Respond to citizen needs
   * Update status in real-time

4. **Guest**

   * Browse public disaster information and safety tips
   * View ongoing alerts and warnings
   * Access the platform without signing in or creating an account

---

## 🛠️ Tech Stack

| Technology    | Purpose                           |
| ------------- | --------------------------------- |
| MongoDB       | NoSQL database for storage        |
| Express.js    | Backend framework                 |
| React.js      | Frontend UI                       |
| Node.js       | Backend runtime                   |
| PWA           | Offline capabilities              |
| Map APIs      | Location tracking & visualization |

---

## 🧩 Folder Structure (Optional)

```
rescuenet/
├── frontend/        # React frontend
├── bacend/          # Node + Express backend
├── models/          # Mongoose schemas
├── routes/          # API routes
├── public/          # Static files and PWA assets
└── README.md
```

---

## 🧪 Installation

### Prerequisites:

* Node.js
* MongoDB

### Steps:

```bash
# Clone the repository
git clone https://github.com/yourusername/rescuenet.git
cd rescuenet

# Install backend dependencies
cd bacend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Run the development servers
npm run dev  # concurrently runs client & server
```

---

## 🤝 Contributing

1. Fork this repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes
4. Push and open a Pull Request

---

## Happy Coding...
