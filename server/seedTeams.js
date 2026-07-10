// backend/seedTeams.js
const mongoose = require('mongoose');
const Team = require('./models/Team');
require('dotenv').config();

const EPL_TEAMS = [
  {
    id: "ARS",
    name: "Arsenal",
    shortName: "ARS",
    stadium: "Emirates Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t3.png",
    manager: "Mikel Arteta",
    primaryColor: "#EF0107",
    capacity: "60,704",
    topScorers: [
      { rank: 1, name: "Viktor Gyökeres", initials: "VG", position: "Forward", goals: 14, assists: 1 },
      { rank: 2, name: "Bukayo Saka", initials: "BS", position: "Midfielder", goals: 8, assists: 7 },
      { rank: 3, name: "Eberechi Eze", initials: "EE", position: "Midfielder", goals: 7, assists: 4 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "56.4%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "19", icon: "Shield" },
      { label: "Goals Scored", value: "71", icon: "Crosshair" }
    ]
  },
  {
    id: "AVL",
    name: "Aston Villa",
    shortName: "AVL",
    stadium: "Villa Park",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t7.png",
    manager: "Unai Emery",
    primaryColor: "#941C4E",
    capacity: "42,640",
    topScorers: [
      { rank: 1, name: "Ollie Watkins", initials: "OW", position: "Forward", goals: 16, assists: 3 },
      { rank: 2, name: "Morgan Rogers", initials: "MR", position: "Midfielder", goals: 8, assists: 5 },
      { rank: 3, name: "Leon Bailey", initials: "LB", position: "Midfielder", goals: 6, assists: 4 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "53.7%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "11", icon: "Shield" },
      { label: "Goals Scored", value: "58", icon: "Crosshair" }
    ]
  },
  {
    id: "BOU",
    name: "Bournemouth",
    shortName: "BOU",
    stadium: "Vitality Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t91.png",
    manager: "Andoni Iraola",
    primaryColor: "#B50E12",
    capacity: "11,364",
    topScorers: [
      { rank: 1, name: "Eli Junior Kroupi", initials: "EK", position: "Forward", goals: 13, assists: 3 },
      { rank: 2, name: "Antoine Semenyo", initials: "AS", position: "Forward", goals: 10, assists: 4 },
      { rank: 3, name: "Marcus Tavernier", initials: "MT", position: "Midfielder", goals: 6, assists: 6 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "50.1%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "10", icon: "Shield" },
      { label: "Goals Scored", value: "58", icon: "Crosshair" }
    ]
  },
  {
    id: "BRE",
    name: "Brentford",
    shortName: "BRE",
    stadium: "Gtech Community Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t94.png",
    manager: "Thomas Frank",
    primaryColor: "#E30613",
    capacity: "17,250",
    topScorers: [
      { rank: 1, name: "Igor Thiago", initials: "IT", position: "Forward", goals: 22, assists: 1 },
      { rank: 2, name: "Kevin Schade", initials: "KS", position: "Forward", goals: 9, assists: 3 },
      { rank: 3, name: "Mikkel Damsgaard", initials: "MD", position: "Midfielder", goals: 5, assists: 7 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "47.5%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "8", icon: "Shield" },
      { label: "Goals Scored", value: "56", icon: "Crosshair" }
    ]
  },
  {
    id: "BHA",
    name: "Brighton & Hove Albion",
    shortName: "BHA",
    stadium: "Amex Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t36.png",
    manager: "Fabian Hürzeler",
    primaryColor: "#0057B8",
    capacity: "31,876",
    topScorers: [
      { rank: 1, name: "Danny Welbeck", initials: "DW", position: "Forward", goals: 13, assists: 1 },
      { rank: 2, name: "João Pedro", initials: "JP", position: "Forward", goals: 8, assists: 4 },
      { rank: 3, name: "Kaoru Mitoma", initials: "KM", position: "Midfielder", goals: 5, assists: 6 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "53.9%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "9", icon: "Shield" },
      { label: "Goals Scored", value: "52", icon: "Crosshair" }
    ]
  },
  {
    id: "BUR",
    name: "Burnley",
    shortName: "BUR",
    stadium: "Turf Moor",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t90.png",
    manager: "Scott Parker",
    primaryColor: "#6C1D45",
    capacity: "21,944",
    topScorers: [
      { rank: 1, name: "Lyle Foster", initials: "LF", position: "Forward", goals: 7, assists: 2 },
      { rank: 2, name: "Josh Brownhill", initials: "JB", position: "Midfielder", goals: 5, assists: 3 },
      { rank: 3, name: "Zeki Amdouni", initials: "ZA", position: "Midfielder", goals: 4, assists: 2 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "42.5%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "6", icon: "Shield" },
      { label: "Goals Scored", value: "38", icon: "Crosshair" }
    ]
  },
  {
    id: "CHE",
    name: "Chelsea",
    shortName: "CHE",
    stadium: "Stamford Bridge",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t8.png",
    manager: "Enzo Maresca",
    primaryColor: "#034694",
    capacity: "40,341",
    topScorers: [
      { rank: 1, name: "João Pedro", initials: "JP", position: "Forward", goals: 15, assists: 5 },
      { rank: 2, name: "Enzo Fernández", initials: "EF", position: "Midfielder", goals: 10, assists: 6 },
      { rank: 3, name: "Cole Palmer", initials: "CP", position: "Midfielder", goals: 10, assists: 7 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "57.7%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "9", icon: "Shield" },
      { label: "Goals Scored", value: "58", icon: "Crosshair" }
    ]
  },
  {
    id: "CRY",
    name: "Crystal Palace",
    shortName: "CRY",
    stadium: "Selhurst Park",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t20.png",
    manager: "Oliver Glasner",
    primaryColor: "#1B458F",
    capacity: "25,486",
    topScorers: [
      { rank: 1, name: "Jean-Philippe Mateta", initials: "JM", position: "Forward", goals: 10, assists: 3 },
      { rank: 2, name: "Eberechi Eze", initials: "EE", position: "Midfielder", goals: 8, assists: 6 },
      { rank: 3, name: "Ismaila Sarr", initials: "IS", position: "Forward", goals: 4, assists: 2 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "45.9%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "7", icon: "Shield" },
      { label: "Goals Scored", value: "48", icon: "Crosshair" }
    ]
  },
  {
    id: "EVE",
    name: "Everton",
    shortName: "EVE",
    stadium: "Goodison Park",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t11.png",
    manager: "Sean Dyche",
    primaryColor: "#003399",
    capacity: "39,572",
    topScorers: [
      { rank: 1, name: "Dominic Calvert-Lewin", initials: "DCL", position: "Forward", goals: 8, assists: 1 },
      { rank: 2, name: "James Garner", initials: "JG", position: "Midfielder", goals: 5, assists: 3 },
      { rank: 3, name: "Dwight McNeil", initials: "DM", position: "Midfielder", goals: 4, assists: 5 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "43.8%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "8", icon: "Shield" },
      { label: "Goals Scored", value: "44", icon: "Crosshair" }
    ]
  },
  {
    id: "FUL",
    name: "Fulham",
    shortName: "FUL",
    stadium: "Craven Cottage",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t54.png",
    manager: "Marco Silva",
    primaryColor: "#000000",
    capacity: "29,600",
    topScorers: [
      { rank: 1, name: "Harry Wilson", initials: "HW", position: "Midfielder", goals: 9, assists: 7 },
      { rank: 2, name: "Raúl Jiménez", initials: "RJ", position: "Forward", goals: 7, assists: 3 },
      { rank: 3, name: "Andreas Pereira", initials: "AP", position: "Midfielder", goals: 5, assists: 8 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "51.7%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "8", icon: "Shield" },
      { label: "Goals Scored", value: "49", icon: "Crosshair" }
    ]
  },
  {
    id: "IPS",
    name: "Ipswich Town",
    shortName: "IPS",
    stadium: "Portman Road",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t40.png",
    manager: "Kieran McKenna",
    primaryColor: "#0000FF",
    capacity: "29,673",
    topScorers: [
      { rank: 1, name: "George Hirst", initials: "GH", position: "Forward", goals: 6, assists: 2 },
      { rank: 2, name: "Conor Chaplin", initials: "CC", position: "Midfielder", goals: 5, assists: 4 },
      { rank: 3, name: "Nathan Broadhead", initials: "NB", position: "Forward", goals: 4, assists: 2 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "44.2%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "5", icon: "Shield" },
      { label: "Goals Scored", value: "41", icon: "Crosshair" }
    ]
  },
  {
    id: "LEI",
    name: "Leicester City",
    shortName: "LEI",
    stadium: "King Power Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t13.png",
    manager: "Steve Cooper",
    primaryColor: "#003090",
    capacity: "32,261",
    topScorers: [
      { rank: 1, name: "Jamie Vardy", initials: "JV", position: "Forward", goals: 9, assists: 2 },
      { rank: 2, name: "Stephy Mavididi", initials: "SM", position: "Forward", goals: 6, assists: 4 },
      { rank: 3, name: "Kiernan Dewsbury-Hall", initials: "KDH", position: "Midfielder", goals: 5, assists: 7 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "49.8%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "7", icon: "Shield" },
      { label: "Goals Scored", value: "47", icon: "Crosshair" }
    ]
  },
  {
    id: "LIV",
    name: "Liverpool",
    shortName: "LIV",
    stadium: "Anfield",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t14.png",
    manager: "Arne Slot",
    primaryColor: "#C8102E",
    capacity: "61,276",
    topScorers: [
      { rank: 1, name: "Hugo Ekitike", initials: "HE", position: "Forward", goals: 11, assists: 3 },
      { rank: 2, name: "Cody Gakpo", initials: "CG", position: "Forward", goals: 7, assists: 4 },
      { rank: 3, name: "Mohamed Salah", initials: "MS", position: "Forward", goals: 6, assists: 7 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "59.3%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "10", icon: "Shield" },
      { label: "Goals Scored", value: "63", icon: "Crosshair" }
    ]
  },
  {
    id: "MCI",
    name: "Manchester City",
    shortName: "MCI",
    stadium: "Etihad Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t43.png",
    manager: "Pep Guardiola",
    primaryColor: "#6CABDD",
    capacity: "53,400",
    topScorers: [
      { rank: 1, name: "Erling Haaland", initials: "EH", position: "Forward", goals: 27, assists: 8 },
      { rank: 2, name: "Antoine Semenyo", initials: "AS", position: "Forward", goals: 7, assists: 2 },
      { rank: 3, name: "Phil Foden", initials: "PF", position: "Midfielder", goals: 7, assists: 5 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "60.7%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "12", icon: "Shield" },
      { label: "Goals Scored", value: "77", icon: "Crosshair" }
    ]
  },
  {
    id: "MUN",
    name: "Manchester United",
    shortName: "MUN",
    stadium: "Old Trafford",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t1.png",
    manager: "Rúben Amorim",
    primaryColor: "#DA291C",
    capacity: "74,310",
    topScorers: [
      { rank: 1, name: "Bruno Fernandes", initials: "BF", position: "Midfielder", goals: 12, assists: 21 },
      { rank: 2, name: "Bryan Mbeumo", initials: "BM", position: "Forward", goals: 9, assists: 4 },
      { rank: 3, name: "Rasmus Højlund", initials: "RH", position: "Forward", goals: 7, assists: 2 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "55.3%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "11", icon: "Shield" },
      { label: "Goals Scored", value: "69", icon: "Crosshair" }
    ]
  },
  {
    id: "NEW",
    name: "Newcastle United",
    shortName: "NEW",
    stadium: "St. James' Park",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t4.png",
    manager: "Eddie Howe",
    primaryColor: "#241F20",
    capacity: "52,305",
    topScorers: [
      { rank: 1, name: "Alexander Isak", initials: "AI", position: "Forward", goals: 10, assists: 4 },
      { rank: 2, name: "Bruno Guimarães", initials: "BG", position: "Midfielder", goals: 7, assists: 6 },
      { rank: 3, name: "Harvey Barnes", initials: "HB", position: "Midfielder", goals: 5, assists: 3 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "51.2%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "9", icon: "Shield" },
      { label: "Goals Scored", value: "54", icon: "Crosshair" }
    ]
  },
  {
    id: "NFO",
    name: "Nottingham Forest",
    shortName: "NFO",
    stadium: "City Ground",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t17.png",
    manager: "Nuno Espírito Santo",
    primaryColor: "#DD0000",
    capacity: "30,445",
    topScorers: [
      { rank: 1, name: "Morgan Gibbs-White", initials: "MGW", position: "Midfielder", goals: 15, assists: 4 },
      { rank: 2, name: "Chris Wood", initials: "CW", position: "Forward", goals: 8, assists: 2 },
      { rank: 3, name: "Anthony Elanga", initials: "AE", position: "Midfielder", goals: 5, assists: 6 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "46.8%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "8", icon: "Shield" },
      { label: "Goals Scored", value: "52", icon: "Crosshair" }
    ]
  },
  {
    id: "SUN",
    name: "Sunderland",
    shortName: "SUN",
    stadium: "Stadium of Light",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t56.png",
    manager: "Regis Le Bris",
    primaryColor: "#FF0000",
    capacity: "49,000",
    topScorers: [
      { rank: 1, name: "Brian Brobbey", initials: "BB", position: "Forward", goals: 9, assists: 3 },
      { rank: 2, name: "Enzo Le Fée", initials: "ELF", position: "Midfielder", goals: 6, assists: 7 },
      { rank: 3, name: "Jack Clarke", initials: "JC", position: "Midfielder", goals: 5, assists: 5 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "48.5%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "7", icon: "Shield" },
      { label: "Goals Scored", value: "50", icon: "Crosshair" }
    ]
  },
  {
    id: "TOT",
    name: "Tottenham Hotspur",
    shortName: "TOT",
    stadium: "Tottenham Hotspur Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t6.png",
    manager: "Ange Postecoglou",
    primaryColor: "#132257",
    capacity: "62,850",
    topScorers: [
      { rank: 1, name: "Richarlison", initials: "R", position: "Forward", goals: 11, assists: 3 },
      { rank: 2, name: "João Palhinha", initials: "JP", position: "Midfielder", goals: 5, assists: 2 },
      { rank: 3, name: "Cristian Romero", initials: "CR", position: "Defender", goals: 4, assists: 1 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "52.4%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "6", icon: "Shield" },
      { label: "Goals Scored", value: "48", icon: "Crosshair" }
    ]
  },
  {
    id: "WHU",
    name: "West Ham United",
    shortName: "WHU",
    stadium: "London Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t21.png",
    manager: "Julen Lopetegui",
    primaryColor: "#7A263A",
    capacity: "62,500",
    topScorers: [
      { rank: 1, name: "Jarrod Bowen", initials: "JB", position: "Forward", goals: 10, assists: 11 },
      { rank: 2, name: "Mohammed Kudus", initials: "MK", position: "Midfielder", goals: 7, assists: 4 },
      { rank: 3, name: "Edson Álvarez", initials: "EA", position: "Midfielder", goals: 4, assists: 2 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "47.2%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "5", icon: "Shield" },
      { label: "Goals Scored", value: "42", icon: "Crosshair" }
    ]
  },
  {
    id: "WOL",
    name: "Wolverhampton Wanderers",
    shortName: "WOL",
    stadium: "Molineux Stadium",
    logoUrl: "https://resources.premierleague.com/premierleague/badges/t39.png",
    manager: "Gary O'Neil",
    primaryColor: "#FDB913",
    capacity: "32,050",
    topScorers: [
      { rank: 1, name: "Matheus Cunha", initials: "MC", position: "Forward", goals: 8, assists: 4 },
      { rank: 2, name: "Hwang Hee-Chan", initials: "HC", position: "Forward", goals: 5, assists: 2 },
      { rank: 3, name: "Pablo Sarabia", initials: "PS", position: "Midfielder", goals: 4, assists: 5 }
    ],
    statsSummary: [
      { label: "Possession Avg", value: "44.6%", icon: "TrendingUp" },
      { label: "Clean Sheets", value: "4", icon: "Shield" },
      { label: "Goals Scored", value: "37", icon: "Crosshair" }
    ]
  }
];

async function seed() {
  try {
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/prempredict";
    if (!uri) throw new Error("No database connection string found in .env file.");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB for seeding...");

    await Team.deleteMany({});
    await Team.insertMany(EPL_TEAMS);
    console.log("Successfully seeded all 21 EPL teams with top scorers and stats summary!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();