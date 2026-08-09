const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex !== -1) {
        const key = trimmed.slice(0, equalsIndex).trim();
        let val = trimmed.slice(equalsIndex + 1).trim();
        if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

const SUPER_ADMIN_EMAIL = "nazmulsaw@gmail.com";

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, { dbName: "qorvan" });
  console.log("Connected to MongoDB successfully!");

  const userSchema = new mongoose.Schema(
    {
      clerkId: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      name: { type: String, required: true },
      imageUrl: { type: String },
      status: {
        type: String,
        enum: ["active", "suspended"],
        default: "active",
        required: true,
      },
      permissions: [
        {
          module: { type: String, required: true },
          actions: [{ type: String }],
        },
      ],
    },
    { timestamps: true }
  );

  const User = mongoose.models.User || mongoose.model("User", userSchema);

  let user = await User.findOne({ email: SUPER_ADMIN_EMAIL });

  if (!user) {
    user = await User.create({
      clerkId: `temp_${SUPER_ADMIN_EMAIL}`,
      email: SUPER_ADMIN_EMAIL,
      name: "Nazmul Saw",
      status: "active",
      permissions: [],
    });
    console.log("✅ Created new super admin user:", user._id);
  } else {
    user.status = "active";
    await user.save();
    console.log("✅ Updated existing user to active super admin:", user._id);
  }

  // Fetch final document for verification
  const finalUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  console.log("Final User Document:", JSON.stringify(finalUser, null, 2));

  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch((err) => {
  console.error("Error seeding super admin:", err);
  process.exit(1);
});
