// backend/seedStats.js

const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const Standing = require("./models/Standing");

async function seed() {
  try {
    const uri =
      process.env.MONGO_URI ||
      process.env.DATABASE_URL ||
      "mongodb://127.0.0.1:27017/prempredict";

    await mongoose.connect(uri);
    console.log("Connected to MongoDB for standings seeding...");

    await Standing.deleteMany({});
    console.log("Old standings cleared.");

    const teams = {};

    await new Promise((resolve, reject) => {
      fs.createReadStream("season-2526.csv")
        .pipe(csv())
        .on("data", (row) => {
          [row.HomeTeam, row.AwayTeam].forEach((team) => {
            if (!teams[team]) {
              teams[team] = {
                teamName: team,
                played: 0,
                won: 0,
                drawn: 0,
                lost: 0,
                gf: 0,
                ga: 0,
                gd: 0,
                pts: 0,
                season: "2025/26",
              };
            }
          });

          const home = teams[row.HomeTeam];
          const away = teams[row.AwayTeam];

          const homeGoals = Number(row.FTHG);
          const awayGoals = Number(row.FTAG);

          home.played++;
          away.played++;

          home.gf += homeGoals;
          home.ga += awayGoals;

          away.gf += awayGoals;
          away.ga += homeGoals;

          if (row.FTR === "H") {
            home.won++;
            home.pts += 3;
            away.lost++;
          } else if (row.FTR === "A") {
            away.won++;
            away.pts += 3;
            home.lost++;
          } else {
            home.drawn++;
            away.drawn++;
            home.pts++;
            away.pts++;
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    const standings = Object.values(teams).map((team) => ({
      ...team,
      gd: team.gf - team.ga,
    }));

    // Sort like a real EPL table
    standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    await Standing.insertMany(standings);

    console.log(
      `Successfully seeded ${standings.length} Premier League standings!`
    );

    process.exit(0);
  } catch (err) {
    console.error("Error seeding standings:", err);
    process.exit(1);
  }
}

seed();seed