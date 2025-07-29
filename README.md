# Celebrity Styles Hair Salon

A complete salon booking system with user authentication, admin panel, and booking management.

## 🚀 Quick Start

### Option 1: Use the Batch File (Windows)
1. Double-click `start-servers.bat`
2. Wait for both servers to start
3. Open http://localhost:3000 in your browser

### Option 2: Manual Start

#### Start Backend Server
```bash
cd backend
npm install
npm start
```
Backend will run on http://localhost:5000

#### Start Frontend Server (in a new terminal)
```bash
cd frontend
npm install
npm start
```
Frontend will run on http://localhost:3000

## 📱 Access the Application

- **Main App**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin-login.html
- **User Login**: http://localhost:3000/login.html
- **User Signup**: http://localhost:3000/signup.html

## 🔐 Demo Accounts

### Admin Accounts
- **Email**: admin@celebritystyles.com
- **Password**: admin123

- **Email**: manager@celebritystyles.com
- **Password**: manager123

### Regular User Accounts
- **Email**: john.doe@email.com
- **Password**: password123

## 🛠️ Features

### For Users
- ✅ User registration and login
- ✅ Browse salon services
- ✅ Book appointments
- ✅ View booking history
- ✅ Cancel bookings
- ✅ User profile management

### For Admins
- ✅ Admin authentication
- ✅ Employee management
- ✅ User management
- ✅ Booking management
- ✅ Service management
- ✅ Dashboard with statistics

## 🗂️ Project Structure

```
bs/
├── backend/                 # Backend API server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/              # Frontend application
│   ├── images/           # Static images
│   ├── index.html        # Main page
│   ├── login.html        # User login
│   ├── signup.html       # User registration
│   ├── admin-login.html  # Admin login
│   ├── admin-panel.html  # Admin dashboard
│   ├── user-profile.js   # User profile management
│   ├── server.js         # Frontend server
│   └── style.css         # Main stylesheet
└── start-servers.bat     # Quick start script
```

## 🔧 Technical Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Authentication**: JWT tokens
- **Database**: MongoDB Atlas

## 🚨 Troubleshooting

### CORS Errors
If you see CORS errors, make sure:
1. Backend is running on port 5000
2. Frontend is running on port 3000
3. You're accessing the app via http://localhost:3000 (not file://)

### Database Connection Issues
1. Check your MongoDB connection string in `backend/config.env`
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Verify database credentials

### Port Already in Use
If ports 3000 or 5000 are already in use:
1. Find the process: `netstat -ano | findstr :5000`
2. Kill the process: `taskkill /PID <PID> /F`

## 📞 Support

For issues or questions, check the console logs in both terminal windows for error messages. 