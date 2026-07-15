// openMatchesUntil3PM.js
// Temporarily reopens ALL fixtures for predictions until 3:00 PM today (server-clock local time).
// Your existing lock check is: fixture.locked || fixture.kickoff.getTime() <= Date.now()
// So this just sets locked=false and pushes kickoff to 3PM today — no extra cron/relock job needed,
// it locks itself automatically the moment the clock passes 3PM, same as any real fixture would.
//
// Run: node openMatchesUntil3PM.js

const mongoose = require("mongoose");
const Fixture = require("./models/Fixture");

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);

  const today345PM = new Date();
  today345PM.setHours(15, 45, 0, 0); // 3:45 PM local server time

  if (today345PM.getTime() <= Date.now()) {
    console.log("It's already past 3:45 PM today — nothing to open. Adjust the time in this script if needed.");
    await mongoose.disconnect();
    return;
  }

  const result = await Fixture.updateMany(
    {
      // Last year's season only (2025/26)
      kickoff: {
        $gte: new Date("2025-08-01T00:00:00.000Z"),
        $lt: new Date("2026-08-01T00:00:00.000Z"),
      },
    },
    {
      $set: {
        locked: false,
        kickoff: today345PM,
        date: today345PM.toISOString().slice(0, 10),
      },
    }
  );

  console.log(
    `Opened ${result.modifiedCount} fixtures. They'll auto-lock again at 3:45 PM today.`
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});