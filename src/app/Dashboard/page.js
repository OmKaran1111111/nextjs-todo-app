"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InfoBoxes from "@/components/infoboxes";
import PriorityBreakdown from "@/components/PriorityBreakdown";
import UpcomingDeadlines from "@/components/Upcomingdeadlines";
import TopBar from "@/components/topbar";
import Footer from "@/components/footer";

import styles from "./dashboard.module.css";

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

  const COLORS = [
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-info)",
    "var(--color-danger)",
  ];

  const labels = {
    completedBeforeDeadline: "Completed on time",
    completedAfterDeadline: "Completed late",
    remainingBeforeDeadline: "Remaining (not overdue)",
    remainingAfterDeadline: "Remaining (overdue)",
  };

  return (
    <div>
      <TopBar />
      
      <div className={styles.contentWrapper}>
        <InfoBoxes
          totalTasks={numberOfTasks}
          completedTasks={noOfComp}
          remainingTasks={numberOfTasks - noOfComp}
          remainingOnTime={remainingBeforeDeadline}
          remainingOverdue={remainingAfterDeadline}
        />
        <DonutChart data={data} colors={COLORS} labels={labels} />
        <PriorityBreakdown tasks={tasks} />
        <UpcomingDeadlines tasks={tasks} />
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;