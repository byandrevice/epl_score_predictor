export interface Team {
    id: string;
    name: string;
    shortName: string;
    stadium: string;
    logoUrl: string;
  }
  
  export const EPL_TEAMS_DATA: Record<string, Team> = {
    ARS: { id: "ARS", name: "Arsenal", shortName: "ARS", stadium: "Emirates Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t3.png" },
    AVL: { id: "AVL", name: "Aston Villa", shortName: "AVL", stadium: "Villa Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t7.png" },
    BOU: { id: "BOU", name: "Bournemouth", shortName: "BOU", stadium: "Vitality Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t91.png" },
    BRE: { id: "BRE", name: "Brentford", shortName: "BRE", stadium: "Gtech Community Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t94.png" },
    BHA: { id: "BHA", name: "Brighton & Hove Albion", shortName: "BHA", stadium: "Amex Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t36.png" },
    BUR: { id: "BUR", name: "Burnley", shortName: "BUR", stadium: "Turf Moor", logoUrl: "https://resources.premierleague.com/premierleague/badges/t90.png" },
    CHE: { id: "CHE", name: "Chelsea", shortName: "CHE", stadium: "Stamford Bridge", logoUrl: "https://resources.premierleague.com/premierleague/badges/t8.png" },
    CRY: { id: "CRY", name: "Crystal Palace", shortName: "CRY", stadium: "Selhurst Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t14.png" },
    EVE: { id: "EVE", name: "Everton", shortName: "EVE", stadium: "Hill Dickinson Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t11.png" },
    FUL: { id: "FUL", name: "Fulham", shortName: "FUL", stadium: "Craven Cottage", logoUrl: "https://resources.premierleague.com/premierleague/badges/t54.png" },
    LEE: { id: "LEE", name: "Leeds United", shortName: "LEE", stadium: "Elland Road", logoUrl: "https://resources.premierleague.com/premierleague/badges/t2.png" },
    LIV: { id: "LIV", name: "Liverpool", shortName: "LIV", stadium: "Anfield", logoUrl: "https://resources.premierleague.com/premierleague/badges/t14.png" },
    MCI: { id: "MCI", name: "Manchester City", shortName: "MCI", stadium: "Etihad Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t43.png" },
    MUN: { id: "MUN", name: "Manchester United", shortName: "MUN", stadium: "Old Trafford", logoUrl: "https://resources.premierleague.com/premierleague/badges/t1.png" },
    NEW: { id: "NEW", name: "Newcastle United", shortName: "NEW", stadium: "St. James' Park", logoUrl: "https://resources.premierleague.com/premierleague/badges/t4.png" },
    NFO: { id: "NFO", name: "Nottingham Forest", shortName: "NFO", stadium: "City Ground", logoUrl: "https://resources.premierleague.com/premierleague/badges/t17.png" },
    SUN: { id: "SUN", name: "Sunderland", shortName: "SUN", stadium: "Stadium of Light", logoUrl: "https://resources.premierleague.com/premierleague/badges/t56.png" },
    TOT: { id: "TOT", name: "Tottenham Hotspur", shortName: "TOT", stadium: "Tottenham Hotspur Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t6.png" },
    WHU: { id: "WHU", name: "West Ham United", shortName: "WHU", stadium: "London Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t21.png" },
    WOL: { id: "WOL", name: "Wolverhampton Wanderers", shortName: "WOL", stadium: "Molineux Stadium", logoUrl: "https://resources.premierleague.com/premierleague/badges/t39.png" },
  };