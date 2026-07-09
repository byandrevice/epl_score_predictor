// backend/seedTeams.js
const mongoose = require('mongoose');
const Team = require('./models/Team');
require('dotenv').config(); // Loads environment variables

const EPL_TEAMS = [
  { id: "ARS", name: "Arsenal", shortName: "ARS", stadium: "Emirates Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t3.png", manager: "Mikel Arteta", primaryColor: "#EF0107", capacity: "60,704" },
  { id: "AVL", name: "Aston Villa", shortName: "AVL", stadium: "Villa Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t7.png", manager: "Unai Emery", primaryColor: "#941C4E", capacity: "42,640" },
  { id: "BOU", name: "Bournemouth", shortName: "BOU", stadium: "Vitality Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t91.png", manager: "Andoni Iraola", primaryColor: "#B50E12", capacity: "11,364" },
  { id: "BRE", name: "Brentford", shortName: "BRE", stadium: "Gtech Community Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t94.png", manager: "Thomas Frank", primaryColor: "#E30613", capacity: "17,250" },
  { id: "BHA", name: "Brighton & Hove Albion", shortName: "BHA", stadium: "Amex Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t36.png", manager: "Fabian Hürzeler", primaryColor: "#0057B8", capacity: "31,876" },
  { id: "BUR", name: "Burnley", shortName: "BUR", stadium: "Turf Moor", logoUrl: "https://resources.premierleague.com/premierleague/badges/t90.png", manager: "Scott Parker", primaryColor: "#6C1D45", capacity: "21,944" },
  { id: "CHE", name: "Chelsea", shortName: "CHE", stadium: "Stamford Bridge", logoUrl: "https://resources.premierleague.com/premierleague/badges/t8.png", manager: "Enzo Maresca", primaryColor: "#034694", capacity: "40,341" },
  { id: "CRY", name: "Crystal Palace", shortName: "CRY", stadium: "Selhurst Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t20.png", manager: "Oliver Glasner", primaryColor: "#1B458F", capacity: "25,486" },
  { id: "EVE", name: "Everton", shortName: "EVE", stadium: "Goodison Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t11.png", manager: "Sean Dyche", primaryColor: "#003399", capacity: "39,572" },
  { id: "FUL", name: "Fulham", shortName: "FUL", stadium: "Craven Cottage", logoUrl: "https://resources.premierleague.com/premierleague/badges/t54.png", manager: "Marco Silva", primaryColor: "#000000", capacity: "29,600" },
  { id: "IPS", name: "Ipswich Town", shortName: "IPS", stadium: "Portman Road", logoUrl: "https://resources.premierleague.com/premierleague/badges/t40.png", manager: "Kieran McKenna", primaryColor: "#0000FF", capacity: "29,673" },
  { id: "LEI", name: "Leicester City", shortName: "LEI", stadium: "King Power Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t13.png", manager: "Steve Cooper", primaryColor: "#003090", capacity: "32,261" },
  { id: "LIV", name: "Liverpool", shortName: "LIV", stadium: "Anfield", logoUrl: "https://resources.premierleague.com/premierleague/badges/t14.png", manager: "Arne Slot", primaryColor: "#C8102E", capacity: "61,276" },
  { id: "MCI", name: "Manchester City", shortName: "MCI", stadium: "Etihad Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t43.png", manager: "Pep Guardiola", primaryColor: "#6CABDD", capacity: "53,400" },
  { id: "MUN", name: "Manchester United", shortName: "MUN", stadium: "Old Trafford", logoUrl: "https://resources.premierleague.com/premierleague/badges/t1.png", manager: "Rúben Amorim", primaryColor: "#DA291C", capacity: "74,310" },
  { id: "NEW", name: "Newcastle United", shortName: "NEW", stadium: "St. James' Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t4.png", manager: "Eddie Howe", primaryColor: "#241F20", capacity: "52,305" },
  { id: "NFO", name: "Nottingham Forest", shortName: "NFO", stadium: "City Ground", logoUrl: "https://resources.premierleague.com/premierleague/badges/t17.png", manager: "Nuno Espírito Santo", primaryColor: "#DD0000", capacity: "30,445" },
  { id: "SUN", name: "Sunderland", shortName: "SUN", stadium: "Stadium of Light", logoUrl: "https://resources.premierleague.com/premierleague/badges/t56.png", manager: "Regis Le Bris", primaryColor: "#FF0000", capacity: "49,000" },
  { id: "TOT", name: "Tottenham Hotspur", shortName: "TOT", stadium: "Tottenham Hotspur Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t6.png", manager: "Ange Postecoglou", primaryColor: "#132257", capacity: "62,850" },
  { id: "WHU", name: "West Ham United", shortName: "WHU", stadium: "London Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t21.png", manager: "Julen Lopetegui", primaryColor: "#7A263A", capacity: "62,500" },
  { id: "WOL", name: "Wolverhampton Wanderers", shortName: "WOL", stadium: "Molineux Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t39.png", manager: "Gary O'Neil", primaryColor: "#FDB913", capacity: "32,050" }
];

async function seed() {
  try {
    // Falls back to standard database keys if MONGO_URI varies
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/prempredict";
    if (!uri) throw new Error("No database connection string found in .env file.");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    // Drops stale entries so we don't accidentally write duplicates
    await Team.deleteMany({});
    
    // Inject documents cleanly
    await Team.insertMany(EPL_TEAMS);
    console.log("Successfully seeded all 21 EPL teams into the DB!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();