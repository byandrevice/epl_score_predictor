import React, { useEffect, useState } from "react";
import { useParams } from "react-router";

export default function TeamProfilePage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [teamData, setTeamData] = useState<any>(null);

  useEffect(() => {
    // Fetch live team analytics from your local server/API using the id
    fetch(`http://localhost:5001/api/teams/${teamId}`)
      .then((res) => res.json())
      .then((data) => setTeamData(data));
  }, [teamId]);

  if (!teamData) return <div>Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card border border-border rounded-xl">
      <h1 className="text-3xl font-black uppercase">{teamData.name} Profile</h1>
      <p className="text-muted-foreground">Stadium: {teamData.venue}</p>
      {/* Rest of your clean UI styling */}
    </div>
  );
}