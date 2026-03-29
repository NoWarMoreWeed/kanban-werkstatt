import React from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { BoardDetailPage } from "../pages/BoardDetailPage";
import { BoardOverviewPage } from "../pages/BoardOverviewPage";
import { StatisticsPage } from "../pages/StatisticsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <BoardOverviewPage />
      },
      {
        path: "boards/:boardId",
        element: <BoardDetailPage />
      },
      {
        path: "statistics",
        element: <StatisticsPage />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
