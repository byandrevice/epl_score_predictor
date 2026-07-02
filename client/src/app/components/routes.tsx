import { createBrowserRouter, redirect } from "react-router";
import AuthPage from "../../pages/AuthPage"; 
import DashboardLayout from "../../layouts/DashboardLayout"; 
import FixturesPage from "../../pages/FixturesPage";
import PlaceholderPage from "../../pages/PlaceholderPage"; 
import StatsGallery from "../../pages/StatsGallery"; 
import { createElement } from "react";

const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
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
