# Celebrity Styles Hair Salon - Backend API

This is the backend API for the Celebrity Styles Hair Salon booking system.

## Features

- **User Authentication**: Register, login, and JWT token management
- **Booking Management**: Create, view, update, and delete appointments
- **Service Management**: CRUD operations for salon services
- **Employee Management**: Manage employees and their specialties
- **Admin Dashboard**: Statistics, reports, and booking management
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `config.env` and update the values
   - Set your MongoDB connection string
   - Configure JWT secret
   - Set up email credentials (optional)

3. **Install MongoDB**:
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas (cloud service)

4. **Run the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings (admin)
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Delete booking

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get single service
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/service/:serviceId` - Get employees by service
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee (admin)
- `PUT /api/employees/:id` - Update employee (admin)
- `DELETE /api/employees/:id` - Delete employee (admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/bookings` - Get filtered bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `GET /api/admin/reports` - Get booking reports

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

## Database Models

### User
- name, email, phone, password
- role (user/admin)
- timestamps

### Booking
- user reference, fullName, mobileNumber, email
- service, selectedEmployee, appointmentDate, selectedTime
- clientNotes, status, totalAmount, paymentStatus
- timestamps

### Service
- name, serviceId, category, description
- price, duration, image, isActive
- timestamps

### Employee
- name, employeeId, email, phone
- specialties (array), position
- workingHours, daysOff, isActive
- timestamps

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/celebrity_styles_salon

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Admin Configuration
ADMIN_EMAIL=admin@celebritystyleshairsalon.com
ADMIN_PASSWORD=admin123

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: express-validator for request validation
- **CORS**: Configured for cross-origin requests
- **Error Handling**: Comprehensive error handling middleware

## Development

- **Hot Reload**: nodemon for development
- **Environment**: Separate config for development/production
- **Logging**: Console logging for debugging
- **Validation**: Request validation with detailed error messages

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Set up MongoDB Atlas or production database
5. Configure email service for notifications
6. Use environment variables for sensitive data

## License

MIT License 