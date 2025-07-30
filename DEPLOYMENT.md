# Celebrity Styles Hair Salon - Deployment Guide

## Overview
This guide will help you deploy the Celebrity Styles Hair Salon application to Render.com successfully.

## Prerequisites
1. A Render.com account
2. MongoDB Atlas account (for cloud database)
3. Git repository with your code

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (M0 Free tier is sufficient)
4. Choose your preferred cloud provider and region

### 1.2 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Create a username and password (save these securely)
4. Set privileges to "Read and write to any database"

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `celebrity_styles`

## Step 2: Render.com Setup

### 2.1 Create Web Service
1. Go to [Render.com](https://render.com)
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Choose the repository containing your code

### 2.2 Configure Service Settings
- **Name**: `celebrity-styles-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Build Command**: `npm install && npm run init-db`
- **Start Command**: `npm start`

### 2.3 Environment Variables
Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/celebrity_styles?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=30d
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

**Note**: For email notifications to work, you need to set up Gmail app passwords. See `EMAIL_SETUP.md` for detailed instructions.

### 2.4 Health Check
- **Health Check Path**: `/api/health`

## Step 3: Frontend Deployment

### 3.1 Create Static Site
1. In Render, click "New +" and select "Static Site"
2. Connect the same Git repository
3. Configure settings:
   - **Name**: `celebrity-styles-frontend`
   - **Build Command**: `echo "Static site - no build required"`
   - **Publish Directory**: `./frontend`

### 3.2 Configure Routes
Add this route configuration:
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

## Step 4: Update Configuration Files

### 4.1 Update render.yaml
The `render.yaml` file in your repository should already be configured correctly.

### 4.2 Update Frontend Config
The `frontend/config.js` file should automatically detect the environment and use the correct backend URL.

## Step 5: Deploy and Test

### 5.1 Deploy Backend
1. Push your code to Git
2. Render will automatically build and deploy
3. Check the logs for any errors
4. Test the health endpoint: `https://your-backend-url.onrender.com/api/health`

### 5.2 Deploy Frontend
1. The frontend will deploy automatically
2. Test the application by visiting the frontend URL
3. Try logging in with test credentials

## Step 6: Database Initialization

### 6.1 Check Database Connection
1. Go to your backend service logs in Render
2. Look for "MongoDB Connected" message
3. Check for any database initialization messages

### 6.2 Verify Collections
The database should automatically create:
- Users collection
- Services collection
- Employees collection
- Bookings collection

## Step 7: Testing

### 7.1 Test User Registration
1. Go to your frontend URL
2. Try registering a new user
3. Check if the user appears in your MongoDB Atlas database

### 7.2 Test User Login
1. Try logging in with the registered user
2. Verify that JWT tokens are generated correctly

### 7.3 Test Admin Access
1. Use the default admin credentials:
   - Email: `admin@celebritystyles.com`
   - Password: `admin123456`

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
- Check if MongoDB Atlas IP whitelist includes Render's IPs
- Verify the connection string is correct
- Check if the database user has proper permissions

#### 2. JWT Errors
- Ensure JWT_SECRET is set in environment variables
- Check if JWT_EXPIRE is set correctly

#### 3. CORS Errors
- Verify the CORS configuration in server.js
- Check if frontend and backend URLs are correct

#### 4. Build Failures
- Check if all dependencies are in package.json
- Verify the build command is correct
- Check the build logs for specific errors

### Debugging Steps

1. **Check Render Logs**
   - Go to your service in Render
   - Click on "Logs" tab
   - Look for error messages

2. **Test API Endpoints**
   - Use tools like Postman or curl
   - Test the health endpoint first
   - Then test authentication endpoints

3. **Check Database**
   - Go to MongoDB Atlas
   - Check if collections are created
   - Verify data is being stored

## Security Considerations

1. **Environment Variables**
   - Never commit sensitive data to Git
   - Use Render's environment variable feature
   - Rotate JWT secrets regularly

2. **Database Security**
   - Use strong passwords for database users
   - Regularly update MongoDB Atlas
   - Monitor database access logs

3. **API Security**
   - Implement rate limiting
   - Use HTTPS in production
   - Validate all input data

## Maintenance

### Regular Tasks
1. Monitor application logs
2. Check database performance
3. Update dependencies regularly
4. Backup database data
5. Monitor Render service status

### Scaling
- Upgrade Render plan if needed
- Consider MongoDB Atlas scaling options
- Implement caching strategies

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render and MongoDB Atlas documentation
3. Check the application logs for specific error messages
4. Verify all configuration settings

## Quick Commands

```bash
# Test database connection locally
npm run init-db

# Check server health
curl https://your-backend-url.onrender.com/api/health

# Test database status
curl https://your-backend-url.onrender.com/api/db-status
``` 