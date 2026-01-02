# Production Environment Variables Guide

## Required Variables (Must Have)

These variables **MUST** be set in production:

### 1. `NODE_ENV`
- **Required**: ✅ Yes
- **Value**: `production`
- **Description**: Sets the application environment
- **Example**: `NODE_ENV=production`

### 2. `MONGODB_URL`
- **Required**: ✅ Yes
- **Description**: MongoDB Atlas connection string for production database
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Note**: Password must be URL-encoded if it contains special characters
- **Example**: `MONGODB_URL=mongodb+srv://produser:encodedpass@cluster.mongodb.net/hortencia_prod`

### 3. `JWT_SECRET`
- **Required**: ✅ Yes
- **Description**: Secret key for signing JWT tokens
- **Security**: Use a strong, random string (at least 32 characters)
- **Example**: `JWT_SECRET=your-super-secret-random-string-min-32-chars`

## Optional Variables (Have Defaults)

These can be omitted if you're happy with the defaults:

### 4. `PORT`
- **Required**: ❌ No (defaults to `3000`)
- **Default**: `3000`
- **Description**: Port number the server listens on
- **When to set**: If your hosting provider requires a specific port
- **Example**: `PORT=8080`

### 5. `CLIENT_URL`
- **Required**: ❌ No (defaults to `*`)
- **Default**: `*` (allows all origins)
- **Description**: Frontend URL for CORS configuration
- **When to set**: **Recommended in production** for security
- **Example**: `CLIENT_URL=https://yourdomain.com`
- **Note**: In production, you should set this to your actual frontend URL instead of `*`

### 6. `JWT_ACCESS_EXPIRATION_MINUTES`
- **Required**: ❌ No (defaults to `30`)
- **Default**: `30` minutes
- **Description**: How long access tokens are valid
- **When to set**: If you want different expiration times
- **Example**: `JWT_ACCESS_EXPIRATION_MINUTES=60`

### 7. `JWT_REFRESH_EXPIRATION_DAYS`
- **Required**: ❌ No (defaults to `20`)
- **Default**: `20` days
- **Description**: How long refresh tokens are valid
- **When to set**: If you want different expiration times
- **Example**: `JWT_REFRESH_EXPIRATION_DAYS=30`

## Optional Variables (Can Be Empty)

These are only needed if you're using the payment feature:

### 8. `PAYSTACK_SECRET_KEY`
- **Required**: ❌ No (can be empty)
- **Description**: Paystack secret key for payment processing
- **When to set**: Only if you're using Paystack payments
- **Example**: `PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx`
- **Note**: Leave empty or omit if not using payments

### 9. `PAYSTACK_PUBLIC_KEY`
- **Required**: ❌ No (can be empty)
- **Description**: Paystack public key for payment processing
- **When to set**: Only if you're using Paystack payments
- **Example**: `PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx`
- **Note**: Leave empty or omit if not using payments

## Variables You Can SKIP in Production

### ❌ `MONGODB_URL_DEV`
- **Required in Production**: ❌ No
- **Description**: Development database connection string
- **Why skip**: Only used when `NODE_ENV=development`
- **Note**: The config validation currently requires it, but it won't be used in production

## Production `.env` Example

### Minimal Production Setup (Required Only):
```env
NODE_ENV=production
MONGODB_URL=mongodb+srv://produser:encodedpass@cluster.mongodb.net/hortencia_prod
JWT_SECRET=your-super-secret-random-string-min-32-chars
```

### Recommended Production Setup (With Security):
```env
NODE_ENV=production
PORT=3000
MONGODB_URL=mongodb+srv://produser:encodedpass@cluster.mongodb.net/hortencia_prod
JWT_SECRET=your-super-secret-random-string-min-32-chars
CLIENT_URL=https://yourdomain.com
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=20
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

### Full Production Setup (All Variables):
```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://yourdomain.com
MONGODB_URL=mongodb+srv://produser:encodedpass@cluster.mongodb.net/hortencia_prod
MONGODB_URL_DEV=mongodb+srv://devuser:encodedpass@cluster.mongodb.net/hortencia_dev
JWT_SECRET=your-super-secret-random-string-min-32-chars
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=20
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different databases** for development and production
3. **Use different JWT secrets** for each environment
4. **Set `CLIENT_URL`** to your actual domain (not `*`)
5. **Use strong JWT secrets** (minimum 32 characters, random)
6. **URL-encode passwords** in connection strings
7. **Use environment-specific Paystack keys** (test vs live)

## Quick Checklist for Production Deployment

- [ ] `NODE_ENV=production` is set
- [ ] `MONGODB_URL` points to production database
- [ ] `JWT_SECRET` is a strong, random string
- [ ] `CLIENT_URL` is set to your actual frontend domain (not `*`)
- [ ] Paystack keys are set (if using payments)
- [ ] All secrets are kept secure and not committed to Git
- [ ] Database user has appropriate permissions
- [ ] IP whitelist is configured in MongoDB Atlas

