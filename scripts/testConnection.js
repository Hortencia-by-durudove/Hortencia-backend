/**
 * Utility script to test MongoDB Atlas connection
 * Usage: node scripts/testConnection.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const config = require("../src/config/config");

// Helper function to URL encode password
function encodePassword(password) {
  return encodeURIComponent(password);
}

// Helper function to decode connection string (for display only)
function maskConnectionString(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
}

async function testConnection() {
  console.log("\n🔍 Testing MongoDB Atlas Connection...\n");
  
  const connectionUrl = config.mongoose.url;
  console.log("Connection URL (masked):", maskConnectionString(connectionUrl));
  console.log("Environment:", config.env);
  console.log("");

  try {
    // Test connection
    await mongoose.connect(connectionUrl, config.mongoose.options);
    console.log("✅ Connection successful!");
    console.log("✅ Connected to:", mongoose.connection.name);
    console.log("✅ Host:", mongoose.connection.host);
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Database has ${collections.length} collection(s)`);
    
    await mongoose.disconnect();
    console.log("\n✅ Test completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Connection failed!\n");
    console.error("Error:", error.message);
    console.error("Code:", error.code || "N/A");
    
    if (error.message.includes("authentication failed") || error.code === 8000) {
      console.error("\n=== Authentication Error Troubleshooting ===\n");
      
      // Check if password might need encoding
      const urlMatch = connectionUrl.match(/\/\/([^:]+):([^@]+)@/);
      if (urlMatch) {
        const [, username, password] = urlMatch;
        const decodedPassword = decodeURIComponent(password);
        
        // Check for special characters
        const specialChars = /[@#$%&+=\/? ]/;
        if (specialChars.test(decodedPassword)) {
          console.error("⚠️  WARNING: Password contains special characters!");
          console.error("   Original password:", decodedPassword);
          console.error("   Encoded password:", encodePassword(decodedPassword));
          console.error("\n   Your connection string should use the encoded password.");
          console.error("   Example:");
          console.error(`   mongodb+srv://${username}:${encodePassword(decodedPassword)}@...`);
        }
      }
      
      console.error("\nCommon fixes:");
      console.error("1. URL-encode special characters in password");
      console.error("2. Add your IP to Atlas Network Access whitelist");
      console.error("3. Verify database user exists and has permissions");
      console.error("4. Check username and password are correct");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("\n=== Network Error ===\n");
      console.error("Possible causes:");
      console.error("1. Internet connection issue");
      console.error("2. Incorrect cluster URL");
      console.error("3. Firewall blocking connection");
    } else if (error.message.includes("timeout")) {
      console.error("\n=== Timeout Error ===\n");
      console.error("Possible causes:");
      console.error("1. IP address not whitelisted");
      console.error("2. Network connectivity issues");
      console.error("3. Atlas cluster is down");
    }
    
    console.error("\nFor more help, see: MONGODB_ATLAS_SETUP.md\n");
    process.exit(1);
  }
}

// Run the test
testConnection();

