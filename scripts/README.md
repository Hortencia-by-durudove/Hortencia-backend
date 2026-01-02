# Scripts

## Create Super Admin

This script creates a super admin user who can then create other admin users through the dashboard.

### Usage

#### Interactive Mode (Recommended)
Run the script without arguments to use interactive prompts:

```bash
npm run create-super-admin
```

or

```bash
node scripts/createSuperAdmin.js
```

The script will prompt you for:
- Full Name
- Email
- Password (hidden input)
- Password Confirmation

#### Command Line Mode
You can also provide all arguments directly:

```bash
node scripts/createSuperAdmin.js "John Doe" "admin@example.com" "SecurePass123"
```

**Arguments:**
1. Full Name (required)
2. Email (required)
3. Password (required)

### Password Requirements

- Minimum 8 characters
- Must contain at least one letter
- Must contain at least one number

### Notes

- The script checks if a super admin already exists and warns you
- Email must be unique (not already registered)
- Password is automatically hashed using bcrypt
- The super admin will have `role: "superAdmin"` and `isActive: true`

### Example

```bash
$ npm run create-super-admin

Connecting to MongoDB...
✓ Connected to MongoDB

=== Create Super Admin ===

Enter full name: John Doe
Enter email: admin@hortencia.com
Enter password (min 8 chars, must contain letter and number): ********

Confirm password: ********

Creating super admin...

✅ Super admin created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: John Doe
Email: admin@hortencia.com
Role: superAdmin
Status: Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can now log in to the admin portal with these credentials.

Database connection closed.
```

