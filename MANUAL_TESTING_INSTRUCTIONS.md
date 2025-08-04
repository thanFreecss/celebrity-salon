# Manual Testing Instructions

## Testing the Custom Booking ID System

### Prerequisites
1. Make sure your backend server is running: `cd backend && npm start`
2. Make sure your frontend server is running: `cd frontend && npm start`
3. Ensure the booking counter is initialized: `cd backend && node initBookingCounter.js`

### Test 1: Create New Bookings and Verify Sequential IDs

1. **Open the main website**: Navigate to `http://localhost:3000`
2. **Create a booking**:
   - Fill out the booking form
   - Submit the booking
   - Note the booking ID shown in the confirmation
3. **Create another booking**:
   - Fill out a different booking form
   - Submit the booking
   - Verify the booking ID is incremented by 1
4. **Repeat** for 3-5 bookings to confirm sequential numbering

### Test 2: Verify Booking IDs in Admin Panel

1. **Access admin panel**: Navigate to `http://localhost:3000/admin-panel.html`
2. **Login as admin** (use your admin credentials)
3. **Check the reservations table**:
   - Look at the "Booking ID" column
   - Verify IDs start from 1 and increment sequentially
   - Confirm no duplicate IDs exist

### Test 3: Verify Booking IDs in User Profile

1. **Login as a regular user**: Navigate to `http://localhost:3000/login.html`
2. **Access user profile**: Click on profile or account section
3. **Check booking history**:
   - Look at the "Booking ID" column
   - Verify IDs match what you saw in admin panel
   - Confirm IDs are sequential

### Test 4: API Testing (Using Browser Developer Tools)

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Test retrieving booking by ID**:
   ```javascript
   // Replace 1 with an actual booking ID from your system
   fetch('http://localhost:5000/api/bookings/id/1')
     .then(response => response.json())
     .then(data => console.log(data))
     .catch(error => console.error('Error:', error));
   ```
4. **Verify the response** contains the correct booking data

### Test 5: Database Verification

1. **Check MongoDB directly** (if you have MongoDB Compass or similar):
   - Connect to your database
   - Check the `counters` collection for the `bookingId` counter
   - Check the `bookings` collection for the `bookingId` field
   - Verify sequential numbering

## Testing the Password Reset System

### Test 1: Request Password Reset

1. **Navigate to login page**: `http://localhost:3000/login.html`
2. **Click "Forgot Password?"** link
3. **Enter your email address** and submit
4. **Check browser console** for the debug information:
   - Reset URL
   - Reset token
5. **Verify success message** appears

### Test 2: Reset Password (Manual Process)

1. **Copy the reset URL** from the console output
2. **Open the reset URL** in a new tab
3. **Enter a new password** and confirm
4. **Submit the form**
5. **Verify success message** appears

### Test 3: Login with New Password

1. **Navigate to login page**: `http://localhost:3000/login.html`
2. **Enter your email** and the new password
3. **Submit the form**
4. **Verify successful login**

## Expected Results

### Booking ID System
- ✅ Booking IDs start from 1
- ✅ Each new booking gets the next sequential number
- ✅ IDs are consistent across admin panel and user profile
- ✅ API can retrieve bookings by custom ID
- ✅ No duplicate IDs exist

### Password Reset System
- ✅ Forgot password request returns success
- ✅ Debug information appears in console
- ✅ Reset password form accepts new password
- ✅ User can login with new password

## Troubleshooting

### If Booking IDs Don't Work:
1. **Check if counter is initialized**:
   ```bash
   cd backend
   node initBookingCounter.js
   ```
2. **Check server logs** for any errors
3. **Verify database connection** in `config.env`

### If Password Reset Doesn't Work:
1. **Check server logs** for errors
2. **Verify email configuration** in `config.env`
3. **Check browser console** for network errors

### Common Issues:
- **Port conflicts**: Kill existing processes on ports 3000/5000
- **Database connection**: Verify MongoDB is running
- **CORS issues**: Check if frontend can reach backend API

## Next Steps After Testing

1. **Configure real email settings** in `config.env`:
   ```env
   EMAIL_USER=your_actual_email@gmail.com
   EMAIL_PASSWORD=your_actual_app_password
   ```

2. **Enable actual email sending** in `backend/routes/auth.js`:
   - Remove the temporary debug response
   - Uncomment the email sending code

3. **Test complete email flow** with real email addresses

4. **Monitor system performance** with the new booking ID system 