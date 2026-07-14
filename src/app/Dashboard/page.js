"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InfoBoxes from "@/components/infoboxes";
import PriorityBreakdown from "@/components/PriorityBreakdown";
import UpcomingDeadlines from "@/components/Upcomingdeadlines";
import TopBar, { TOPBAR_HEIGHT } from "@/components/topbar";
import Footer, { FOOTER_HEIGHT } from "@/components/footer";

const DonutChart = dynamic(() => import("@/components/donutchart"), {
  ssr: false,
});

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isMounted, setIsMounted] = useState(false); 

  useEffect(() => {
    setIsMounted(true);

    const loadTasks = () => {
      const sTasks = localStorage.getItem("todo_tasks");
      setTasks(sTasks ? JSON.parse(sTasks) : []);
    };

    loadTasks(); 

    window.addEventListener("todo_tasks_updated", loadTasks);
    return () => window.removeEventListener("todo_tasks_updated", loadTasks);
  }, []);

  if (!isMounted) {
    return null; 
  }

  const numberOfTasks = tasks.length;
  const noOfComp = tasks.filter((task) => task.completed).length;

  const now = new Date();

  const completedBeforeDeadline = tasks.filter(
    (task) =>
      task.completed &&
      task.completedAt &&
      task.deadline &&
      new Date(task.completedAt) <= new Date(task.deadline)
  ).length;

  const completedAfterDeadline = tasks.filter(
    (task) =>
      task.completed &&
      task.completedAt &&
      task.deadline &&
      new Date(task.completedAt) > new Date(task.deadline)
  ).length;

  const remainingBeforeDeadline = tasks.filter(
    (task) => !task.completed && task.deadline && new Date(task.deadline) >= now
  ).length;

  const remainingAfterDeadline = tasks.filter(
    (task) => !task.completed && task.deadline && new Date(task.deadline) < now
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

        <div
          className="w-full flex flex-col md:flex-row md:justify-center 
          items-start gap-4 md:gap-8 px-4 mt-4 md:mt-8"
        >
          <PriorityBreakdown tasks={tasks} />
          <UpcomingDeadlines tasks={tasks} />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;