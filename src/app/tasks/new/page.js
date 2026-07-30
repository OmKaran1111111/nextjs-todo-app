"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";
import useTasks from "@/hooks/useTasks";
import "./page.css";

const AddTask = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const {
    tasks,
    isLoading,
    addTask,
    updateTaskPriority,
    updateTaskDeadline,
    toggleComplete,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
  } = useTasks();
  const [inputValue, setInputValue] = useState("");
  const [selectedPriority, setSelectedPriority] = useState(4);
  const [deadline, setDeadline] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const handleClose = () => {
    router.push("/");
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await addTask({
      text: inputValue,
      priority: selectedPriority,
      deadline,

  })
    setInputValue("");
    setSelectedPriority(4);
    setDeadline(null);
  };

  if(isLoading){
    return null;
  }

  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.completed || false) - Number(b.completed || false),
  );

  const highestPriorityTask =
    [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => (a.priority || 4) - (b.priority || 4))[0] || tasks[0];
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || highestPriorityTask;

  const addTaskForm = (
    <form onSubmit={handleAddTask} className="add-task-form">
      <input
        type="text"
        placeholder="Enter a new task..."
        value={inputValue}
        onChange={handleInputChange}
        className="task-input"
      />
      <div className="date-picker-wrapper">
        <span className="date-icon-wrapper">
          📅
          <input
            type="date"
            className="date-input-hidden"
            value={deadline || ""}
            onClick={(e) => e.target.showPicker()}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </span>
        {deadline ? (
          <span className="deadline-text-danger">
            {deadline}
          </span>
        ) : (
          <span className="deadline-text-faint">No deadline set</span>
        )}
      </div>
      <div className="form-bottom-row">
        <div className="priority-wrapper">
          <PriorityDropdown
            currentPriority={selectedPriority}
            onSelect={setSelectedPriority}
          />
          <span className="priority-label">Priority</span>
        </div>
        <button type="submit" className="add-task-btn">
          Add Task
        </button>
      </div>
    </form>
  );

  const renderTaskItem = (task, onSelectName) => (
    <li
      key={task.id}
      className={`task-item ${task.completed ? 'task-item-completed' : ''}`}
    >
      <div className="task-content">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed || false}
          onChange={() => toggleComplete(task.id)}
        />
        <div
          onClick={() => onSelectName(task)}
          className={`task-title ${task.completed ? "task-title-completed" : "task-title-active"}`}
        >
          {task.text}
        </div>

        <div className="task-deadline-wrapper">
          <span className="task-date-icon-wrapper">
            📅
            <input
              type="date"
              className="date-input-hidden"
              value={task.deadline || ""}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) =>
                updateTaskDeadline(task.id, e.target.value)
              }
            />
          </span>
          <span className="task-deadline-text">
            {task.deadline}
          </span>
          <RemainingTime targetDate={task.deadline} />
        </div>
      </div>

      <div>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) =>
            updateTaskPriority(task.id, newPriority)
          }
        />
        <button
          onClick={() => deleteTask(task.id)}
          className="task-delete-btn"
        >
          ✕
        </button>
      </div>
    </li>
  );

  if (isDesktop) {
    return (
      <div className="desktop-container" onClick={handleClose}>
        <div className="desktop-inner" onClick={(e) => e.stopPropagation()}>
          <div className="desktop-left-col">
            <div className="header-row">
              <h3 className="header-title">Add Task</h3>
              <button onClick={handleClose} className="close-btn">
                ✕
              </button>
            </div>

            {addTaskForm}

            <ul className="task-list">
              {sortedTasks.map((task) =>
                renderTaskItem(task, (t) => setSelectedTaskId(t.id)),
              )}
            </ul>
          </div>

          <div className="desktop-right-col">
            <TaskDetails
              task={selectedTask}
              onUpdatePriority={updateTaskPriority}
              onUpdateDeadline={updateTaskDeadline}
              onToggleComplete={toggleComplete}
              onDelete={deleteTask}
              onAddSubtask={addSubtask}
              onToggleSubtask={toggleSubtask} 
              onDeleteSubtask={deleteSubtask}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container" onClick={handleClose}>
      <div className="mobile-inner" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-header-row">
          <h3 className="header-title">Add Task</h3>
          <button className="close-btn" onClick={handleClose}>
            ✕
          </button>
        </div>

        {addTaskForm}

        <ul className="mobile-task-list">
          {sortedTasks.map((task) =>
            renderTaskItem(task, (t) => router.push(`/tasks/${t.id}`)),
          )}
        </ul>
      </div>
    </div>
  );
};

export default AddTask;