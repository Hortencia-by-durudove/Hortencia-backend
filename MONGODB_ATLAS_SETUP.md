# MongoDB Atlas Connection Setup Guide

## Common Authentication Errors and Solutions

### Error: `bad auth : authentication failed` (Code: 8000)

This error typically occurs due to one of the following issues:

## 1. **Password URL Encoding**

If your MongoDB password contains special characters, they MUST be URL-encoded in the connection string.

### Special Characters That Need Encoding:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- ` ` (space) → `%20`

### Example:
If your password is `MyP@ss#123`, the connection string should be:
```
mongodb+srv://username:MyP%40ss%23123@cluster.mongodb.net/database
```

### Quick Fix:
Use an online URL encoder or Node.js:
```javascript
encodeURIComponent('MyP@ss#123') // Returns: MyP%40ss%23123
```

## 2. **IP Address Whitelist**

MongoDB Atlas requires your IP address to be whitelisted.

### Steps:
1. Go to MongoDB Atlas Dashboard
2. Click on **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Either:
   - Add your current IP address (click "Add Current IP Address")
   - Or add `0.0.0.0/0` for development (allows all IPs - **NOT recommended for production**)

### For Development:
You can temporarily allow all IPs:
- Click **Add IP Address**
- Enter `0.0.0.0/0`
- Add a comment: "Development - Allow all IPs"
- ⚠️ **Remove this before going to production!**

## 3. **Database User Permissions**

Ensure your database user has the correct permissions.

### Steps:
1. Go to MongoDB Atlas Dashboard
2. Click on **Database Access** (left sidebar)
3. Find your user
4. Ensure they have:
   - **Atlas admin** role (for full access), OR
   - **Read and write to any database** (for development)

### Create a New User:
1. Click **Add New Database User**
2. Choose **Password** authentication
3. Username: (choose a username)
4. Password: (generate a strong password - **save it!**)
5. Database User Privileges: **Atlas admin** (or custom)
6. Click **Add User**

## 4. **Connection String Format**

### Standard Format:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### Example:
```
mongodb+srv://myuser:MyP%40ss123@cluster0.abc123.mongodb.net/hortencia?retryWrites=true&w=majority
```

### Get Your Connection String:
1. Go to MongoDB Atlas Dashboard
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** and version **5.5 or later**
5. Copy the connection string
6. Replace `<password>` with your actual password (URL-encoded if needed)
7. Replace `<database>` with your database name (e.g., `hortencia`)

## 5. **Environment Variables**

Make sure your `.env` file has the correct connection string:

```env
NODE_ENV=development
MONGODB_URL_DEV=mongodb+srv://username:encodedpassword@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_URL=mongodb+srv://username:encodedpassword@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Important Notes:
- **Never commit `.env` files to Git**
- Use different users/passwords for development and production
- Always URL-encode special characters in passwords

## 6. **Testing Your Connection**

You can test your connection string using MongoDB Compass or a simple Node.js script:

```javascript
const mongoose = require('mongoose');

const uri = 'mongodb+srv://username:password@cluster.mongodb.net/database';

mongoose.connect(uri)
  .then(() => console.log('✅ Connected successfully'))
  .catch((error) => {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('Check: username, password encoding, and user permissions');
    }
  });
```

## Quick Checklist

- [ ] Password is URL-encoded (if it contains special characters)
- [ ] IP address is whitelisted in Network Access
- [ ] Database user exists and has proper permissions
- [ ] Connection string format is correct
- [ ] Database name in connection string matches your actual database
- [ ] `.env` file contains the correct `MONGODB_URL_DEV` or `MONGODB_URL`

## Still Having Issues?

1. **Check MongoDB Atlas Logs:**
   - Go to Atlas Dashboard → Monitoring → Logs
   - Look for authentication errors

2. **Verify Connection String:**
   - Try connecting with MongoDB Compass using the same connection string
   - If Compass works but your app doesn't, check your code

3. **Test with a Simple Script:**
   - Create a test file to isolate the connection issue
   - See example above

4. **Check Mongoose Version:**
   - Ensure you're using a compatible version
   - Current project uses: `mongoose@^8.4.1`

## Security Best Practices

1. **Never hardcode credentials** - Always use environment variables
2. **Use different users** for development and production
3. **Limit IP whitelist** - Don't use `0.0.0.0/0` in production
4. **Rotate passwords** regularly
5. **Use strong passwords** with special characters (remember to encode them!)

