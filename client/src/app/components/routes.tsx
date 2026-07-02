import { createBrowserRouter, redirect } from "react-router";
import AuthPage from "../../pages/AuthPage"; 
import DashboardLayout from "../../layouts/DashboardLayout"; 
import FixturesPage from "../../pages/FixturesPage";
import PlaceholderPage from "../../pages/PlaceholderPage";
import StatsGallery from "../../pages/StatsGallery"; 

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
      /*******************************************************************************
       * 🚨 REMOVE BEFORE PRODUCTION / DEPLOYMENT 🚨
       * LOCAL DEVMOCK ROUTER LOADER INTERCEPTOR
       ******************************************************************************/
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
      /******************************************************************************/

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
        Component: () => createElement(PlaceholderPage, { title: "Predict" }),
      },
      {
        path: "leaderboard",
        Component: () => createElement(PlaceholderPage, { title: "Leaderboard" }),
      },
      {
        path: "stats",
        Component: StatsGallery,
      },
      {
        path: "profile",
        Component: () => createElement(PlaceholderPage, { title: "Profile" }),
      },
    ],
  },
]);

export default router;