// backend/controllers/teamController.js
const Team = require('../models/Team');
const Fixture = require('../models/Fixture');

exports.getTeamProfile = async (req, res) => {
  try {
    const { id } = req.params; // e.g., "ARS"
    const targetId = id.toUpperCase();

    // 1. Fetch target core information out of MongoDB
    const team = await Team.findOne({ id: targetId });
    if (!team) {
      return res.status(404).json({ message: "Club record not found in database." });
    }

    // 2. Query all fixtures involving this team
    const allMatches = await Fixture.find({
      $or: [{ homeShort: targetId }, { awayShort: targetId }]
    }).sort({ kickoff: 1 });

    // 3. Separate matches into played (History) and upcoming groups
    const playedMatches = allMatches.filter(f => f.finalHomeScore !== null && f.finalAwayScore !== null);
    const upcomingRaw = allMatches.filter(f => f.finalHomeScore === null || f.finalAwayScore === null);

    // Compute dynamic layout records
    let won = 0, drawn = 0, lost = 0, gf = 0, ga = 0;
    let rawForm = [];

    playedMatches.forEach(match => {
      const isHome = match.homeShort === targetId;
      const teamGoals = isHome ? match.finalHomeScore : match.finalAwayScore;
      const oppGoals = isHome ? match.finalAwayScore : match.finalHomeScore;

      gf += teamGoals;
      ga += oppGoals;

      if (teamGoals > oppGoals) {
        won++;
        rawForm.push("W");
      } else if (teamGoals === oppGoals) {
        drawn++;
        rawForm.push("D");
      } else {
        lost++;
        rawForm.push("L");
      }
    });

    // Take the last 5 elements for the form streak ring components
    const recentForm = rawForm.slice(-5);

    // Format upcoming fixtures to match your frontend interface contract schema
    const formattedUpcoming = upcomingRaw.slice(0, 3).map(f => {
      const isHome = f.homeShort === targetId;
      return {
        id: f._id,
        opponent: isHome ? f.away : f.home,
        opponentShort: isHome ? f.awayShort : f.homeShort,
        opponentCrest: isHome ? f.awayCrest : f.homeCrest,
        date: f.date,
        time: f.time,
        venue: isHome ? "H" : "A",
        competition: "Premier League"
      };
    });

    // 4. Fallback Data definitions for Scorers and Stats (Since not tracked in DB)
    const mockScorersByTeam = {
      ARS: [
        { rank: 1, name: "Bukayo Saka", initials: "BS", position: "Forward", goals: 16, assists: 9 },
        { rank: 2, name: "Kai Havertz", initials: "KH", position: "Midfielder", goals: 12, assists: 4 }
      ],
      MCI: [
        { rank: 1, name: "Erling Haaland", initials: "EH", position: "Forward", goals: 27, assists: 5 },
        { rank: 2, name: "Phil Foden", initials: "PF", position: "Midfielder", goals: 17, assists: 8 }
      ]
    };

    const mockStatsByTeam = {
      ARS: [
        { label: "Possession Avg", value: "58.2%", icon: "TrendingUp" },
        { label: "Clean Sheets", value: "15", icon: "Shield" },
        { label: "Shots Per Match", value: "16.4", icon: "Crosshair" }
      ]
    };

    // Construct unified context response structure
    res.json({
      success: true,
      club: {
        name: team.name,
        shortName: team.shortName,
        logoUrl: team.logoUrl,
        stadium: team.stadium,
        manager: team.manager,
        capacity: team.capacity,
        primaryColor: team.primaryColor,
        played: playedMatches.length,
        won, drawn, lost, gf, ga,
        gd: gf - ga >= 0 ? `+${gf - ga}` : `${gf - ga}`,
        pts: (won * 3) + drawn,
        rank: targetId === "MCI" ? 1 : 2 // Placeholder placement standing values
      },
      form: recentForm,
      upcoming: formattedUpcoming,
      scorers: mockScorersByTeam[targetId] || [],
      stats: mockStatsByTeam[targetId] || []
    });

  } catch (error) {
    res.status(500).json({ message: "Internal metrics evaluation pipeline error.", error: error.message });
  }
};