const mongoose = require("mongoose");
const readline = require("readline");
const config = require("../src/config/config");
const User = require("../src/models/user.model");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Helper function to ask for password (hidden input)
function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let password = "";
    process.stdin.on("data", function (char) {
      char = char.toString();

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(password);
          break;
        case "\u0003":
          process.exit();
          break;
        case "\u007f": // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
          break;
        default:
          password += char;
          process.stdout.write("*");
          break;
      }
    });
  });
}

// Validate password
function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!password.match(/\d/)) {
    return "Password must contain at least one number";
  }
  if (!password.match(/[a-zA-Z]/)) {
    return "Password must contain at least one letter";
  }
  return null;
}

// Main function
async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log("✓ Connected to MongoDB\n");

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: "superAdmin" });
    if (existingSuperAdmin) {
      console.log("⚠️  A super admin already exists:");
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.fullName}\n`);
      
      const overwrite = await askQuestion(
        "Do you want to create another super admin? (yes/no): "
      );
      if (overwrite.toLowerCase() !== "yes" && overwrite.toLowerCase() !== "y") {
        console.log("Operation cancelled.");
        process.exit(0);
      }
    }

    // Get user input from command line arguments or prompt
    let fullName, email, password;

    if (process.argv.length >= 5) {
      // Use command line arguments
      fullName = process.argv[2];
      email = process.argv[3];
      password = process.argv[4];
      console.log("Using command line arguments...\n");
    } else {
      // Interactive mode
      console.log("=== Create Super Admin ===\n");
      
      fullName = await askQuestion("Enter full name: ");
      if (!fullName.trim()) {
        throw new Error("Full name is required");
      }

      email = await askQuestion("Enter email: ");
      if (!email.trim()) {
        throw new Error("Email is required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Check if email is already taken
      const emailTaken = await User.isEmailTaken(email);
      if (emailTaken) {
        throw new Error("Email is already taken");
      }

      // Get password with validation
      let passwordError;
      do {
        password = await askPassword("Enter password (min 8 chars, must contain letter and number): ");
        passwordError = validatePassword(password);
        if (passwordError) {
          console.log(`\n❌ ${passwordError}`);
          const retry = await askQuestion("Try again? (yes/no): ");
          if (retry.toLowerCase() !== "yes" && retry.toLowerCase() !== "y") {
            throw new Error("Password validation cancelled");
          }
        }
      } while (passwordError);

      // Confirm password
      let confirmPassword;
      do {
        confirmPassword = await askPassword("\nConfirm password: ");
        if (password !== confirmPassword) {
          console.log("\n❌ Passwords do not match");
          const retry = await askQuestion("Try again? (yes/no): ");
          if (retry.toLowerCase() !== "yes" && retry.toLowerCase() !== "y") {
            throw new Error("Password confirmation cancelled");
          }
        }
      } while (password !== confirmPassword);
    }

    // Validate password from command line
    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }
    }

    // Create super admin
    console.log("\nCreating super admin...");
    const superAdmin = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: "superAdmin",
      isActive: true,
    });

    console.log("\n✅ Super admin created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Name: ${superAdmin.fullName}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Role: ${superAdmin.role}`);
    console.log(`Status: ${superAdmin.isActive ? "Active" : "Inactive"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("You can now log in to the admin portal with these credentials.");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    // Close readline interface
    rl.close();
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed.");
    process.exit(0);
  }
}

// Run the script
createSuperAdmin();

