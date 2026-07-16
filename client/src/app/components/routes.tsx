import { createBrowserRouter, redirect } from "react-router";

import DashboardLayout from "../../layouts/DashboardLayout"; 

import AuthPage from "../../pages/AuthPage"; 
import FixturesPage from "../../pages/FixturesPage";
import LeaderboardPage from "../../pages/LeaderboardPage"; 
import PredictPage from "../../pages/PredictPage"; 
import ProfilePage from "../../pages/ProfilePage"; 
import PublicProfilePage from "../../pages/PublicProfilePage"; 

import StatsGallery from "../../pages/StatsGallery"; 
import TeamProfilePage from "../../pages/TeamProfilePage"; 

import { dashboardApi } from "../../api/dashboardApi"; 

import { createElement } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    loader: async () => {
      const token = localStorage.getItem("auth_token");
      if (token === "dev_bypass_mock_token") {
        return {
          username: "DevTester_Bypass",
          avatarInitials: "DT",
          globalRank: "#1",
          gameweekNumber: 38,
          gameweekIsOpen: true,
          deadlineText: "Sun 15:00"
        };
      }

      try {
        const data = await dashboardApi.getLayoutMeta();
        return data; 
      } catch (error) {
        console.error("Dashboard metadata sync failed, redirecting back to landing:", error);
        return redirect("/");
      }
    },
    children: [
      {
        index: true,
        loader: () => redirect("/dashboard/fixtures"),
      },
      {
        path: "fixtures",
        Component: FixturesPage,
      },
      {
        path: "predict",
        Component: PredictPage,
      },
      {
        path: "leaderboard",
        Component: LeaderboardPage,
      },
      {
        path: "stats",
        Component: StatsGallery,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
      {
        path: "user/:userId",
        Component: PublicProfilePage,
      },
      {
        path: "team/:teamId",
        Component: TeamProfilePage,
      },
    ],
  },
]);

export default router;