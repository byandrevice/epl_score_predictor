// openMatchesUntil852PM.js
// Temporarily reopens ALL fixtures for predictions until 8:52 PM today (server-clock local time).
// Your existing lock check is: fixture.locked || fixture.kickoff.getTime() <= Date.now()
// So this just sets locked=false and pushes kickoff to 8:52 PM today — no extra cron/relock job needed,
// it locks itself automatically the moment the clock passes 8:52 PM, same as any real fixture would.
//
// Run: node openMatchesUntil852PM.js

const mongoose = require("mongoose");
const Fixture = require("./models/Fixture");

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);

  const today852PM = new Date();
  today852PM.setHours(20, 52, 0, 0); // 8:52 PM local server time (24-hour format)

  if (today852PM.getTime() <= Date.now()) {
    console.log("It's already past 8:52 PM today — nothing to open. Adjust the time in this script if needed.");
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
        kickoff: today852PM,
        date: today852PM.toISOString().slice(0, 10),
      },
    }
  );

  console.log(
    `Opened ${result.modifiedCount} fixtures. They'll auto-lock again at 8:52 PM today.`
  );

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});