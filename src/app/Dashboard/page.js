"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InfoBoxes from "@/components/infoboxes";
import TopBar, { TOPBAR_HEIGHT } from "@/components/topbar";
import Footer, { FOOTER_HEIGHT } from "@/components/footer";

// Recharts measures its container on mount, so it's loaded client-only to
// avoid a 0-width flash / hydration mismatch during SSR.
const DonutChart = dynamic(() => import("@/components/donutchart"), {
  ssr: false,
});

const Dashboard = () => {
  const [Tasks, setTasks] = useState(() => {
    if (typeof window === "undefined") return [];
    const sTasks = localStorage.getItem("todo_tasks");
    return sTasks ? JSON.parse(sTasks) : [];
  });

  useEffect(() => {
    const handleTasksUpdated = () => {
      const sTasks = localStorage.getItem("todo_tasks");
      setTasks(sTasks ? JSON.parse(sTasks) : []);
    };
    window.addEventListener("todo_tasks_updated", handleTasksUpdated);
    return () =>
      window.removeEventListener("todo_tasks_updated", handleTasksUpdated);
  }, []);

  const numberOfTasks = Tasks.length;
  const noOfComp = Tasks.filter((task) => task.completed).length;

  const now = new Date();

  const completedBeforeDeadline = Tasks.filter(
    (task) =>
      task.completed &&
      task.completedAt &&
      new Date(task.completedAt) <= new Date(task.deadline),
  ).length;

  const completedAfterDeadline = Tasks.filter(
    (task) =>
      task.completed &&
      task.completedAt &&
      new Date(task.completedAt) > new Date(task.deadline),
  ).length;

  const remainingBeforeDeadline = Tasks.filter(
    (task) => !task.completed && new Date(task.deadline) >= now,
  ).length;

  const remainingAfterDeadline = Tasks.filter(
    (task) => !task.completed && new Date(task.deadline) < now,
  ).length;

  const data = [
    { name: "completedBeforeDeadline", value: completedBeforeDeadline },
    { name: "completedAfterDeadline", value: completedAfterDeadline },
    { name: "remainingBeforeDeadline", value: remainingBeforeDeadline },
    { name: "remainingAfterDeadline", value: remainingAfterDeadline },
  ];

  const COLORS = ["#22C55E", "#F59E0B", "#3B82F6", "#EF4444"];

  const labels = {
    completedBeforeDeadline: "Completed on time",
    completedAfterDeadline: "Completed late",
    remainingBeforeDeadline: "Remaining (not overdue)",
    remainingAfterDeadline: "Remaining (overdue)",
  };

  return (
    <div>
      <TopBar />
      <div style={{ paddingTop: TOPBAR_HEIGHT, paddingBottom: FOOTER_HEIGHT }}>
        <div
          className="w-full flex flex-col md:flex-row md:justify-center 
          items-center gap-4 md:gap-8 px-4"
        >
          <InfoBoxes
            totalTasks={numberOfTasks}
            completedTasks={noOfComp}
            remainingTasks={numberOfTasks - noOfComp}
            remainingOnTime={remainingBeforeDeadline}
            remainingOverdue={remainingAfterDeadline}
          />
          <DonutChart data={data} colors={COLORS} labels={labels} />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;