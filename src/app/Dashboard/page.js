"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import InfoBoxes from "@/components/infoboxes";
import PriorityBreakdown from "@/components/PriorityBreakdown";
import UpcomingDeadlines from "@/components/Upcomingdeadlines";
import { TaskListSkeleton } from "@/components/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import useTasks from "@/hooks/useTasks";

const DonutChart = dynamic(() => import("@/components/donutchart"), {
  ssr: false,
});

const Dashboard = () => {
  const { tasks, isLoading } = useTasks();

  if (isLoading) {
    return (
      <main className="page-shell page-shell--cozy">
        <div className="page-shell-inner page-shell-inner--fluid">
          <div className="flex w-full flex-col gap-6 md:gap-8">
            <TaskListSkeleton rows={4} />
          </div>
        </div>
      </main>
    );
  }

  const numberOfTasks = tasks.length;
  const noOfComp = tasks.filter((task) => task.completed).length;

  const now = new Date();

  const completedBeforeDeadline = tasks.filter(
    (task) =>
      task.completed &&
      task.completedAt &&
      task.deadline &&
      new Date(task.completedAt) <= new Date(task.deadline),
  ).length;

  const completedAfterDeadline = tasks.filter(
    (task) =>
      task.completed &&
      task.completedAt &&
      task.deadline &&
      new Date(task.completedAt) > new Date(task.deadline),
  ).length;

  const remainingBeforeDeadline = tasks.filter(
    (task) =>
      !task.completed && task.deadline && new Date(task.deadline) >= now,
  ).length;

  const remainingAfterDeadline = tasks.filter(
    (task) => !task.completed && task.deadline && new Date(task.deadline) < now,
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
    <main className="page-shell page-shell--cozy">
      <div className="page-shell-inner page-shell-inner--fluid">
        <div className="flex w-full flex-col gap-6 md:gap-8">
          <PageHeader title="Dashboard" />

          <InfoBoxes
            totalTasks={numberOfTasks}
            completedTasks={noOfComp}
            remainingTasks={numberOfTasks - noOfComp}
            remainingOverdue={remainingAfterDeadline}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.3fr_1fr] md:items-start md:gap-8">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elevated p-4 shadow-card">
              <span className="text-sm font-bold text-heading">
                Completion Overview
              </span>
              <DonutChart data={data} colors={COLORS} labels={labels} />
            </div>

            <div className="flex flex-col gap-6">
              <PriorityBreakdown tasks={tasks} />
              <UpcomingDeadlines tasks={tasks} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
