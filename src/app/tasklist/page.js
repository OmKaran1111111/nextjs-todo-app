"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import TaskDetails from "@/components/TaskDetails";
import useIsDesktop from "@/hooks/useIsDesktop";

const TaskList = () => {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const isFirstSave = useRef(true);
  useEffect(() => {
    const storedTasks = localStorage.getItem("todo_tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  useEffect(() => {
	if (isFirstSave.current) {
      	  isFirstSave.current = false;
    	  return;
   	 	}
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
    window.dispatchEvent(new Event("todo_tasks_updated"));
  }, [tasks]);

  const handleClose = () => {
    router.push("/");
  };

  const handleDeleteTask = (idToDelete) => {
    setTasks(tasks.filter((task) => task.id !== idToDelete));
    if (selectedTaskId === idToDelete) setSelectedTaskId(null);
  };

  const handleUpdateTaskPriority = (taskId, newPriority) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, priority: newPriority } : task,
      ),
    );
  };

  const handleUpdateTaskDeadline = (taskId, newDeadline) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, deadline: newDeadline } : task,
      ),
    );
  };

  const handleToggleComplete = (taskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleAddSubtask = (taskId, text) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: [
                ...(task.subtasks || []),
                { id: Date.now(), text, completed: false },
              ],
            }
          : task,
      ),
    );
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask,
              ),
            }
          : task,
      ),
    );
  };

  const handleDeleteSubtask = (taskId, subtaskId) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: (task.subtasks || []).filter(
                (subtask) => subtask.id !== subtaskId,
              ),
            }
          : task,
      ),
    );
  };

  const sortedTasks = [...tasks].sort(
    (a, b) => Number(a.completed || false) - Number(b.completed || false),
  );

  const highestPriorityTask =
    [...tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => (a.priority || 4) - (b.priority || 4))[0] || tasks[0];
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) || highestPriorityTask;

  const renderTaskItem = (task, onSelectName) => (
    <li
      key={task.id}
      className={`flex items-center justify-center relative p-[20px_55px] 
				sm:p-[20px_55px] p-[16px_45px] mb-3.5 rounded-2xl min-h-[95px] 
				sm:min-h-[95px] min-h-[80px] bg-surface backdrop-blur-xl backdrop-saturate-200 
				border border-border-strong 
				shadow-card
				transition-[transform,background-color,box-shadow] duration-300 
				ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 
				hover:bg-surface-hover hover:shadow-card-lg
				${
          task.completed
            ? `opacity-40 !bg-surface-soft !border-border-soft 
				!shadow-none !transform-none line-through text-faint`
            : ""
        }`}
    >
      <div className="flex flex-col items-center justify-center flex-1">
        <input
          type="checkbox"
          className="absolute left-5 top-1/2 -translate-y-1/2 appearance-none w-5 
						h-5 border-2 border-border-strong rounded-full cursor-pointer transition-all 
						duration-200 shrink-0 checked:bg-primary 
						checked:border-primary checked:after:content-['✓'] 
						checked:after:text-primary-contrast checked:after:text-[14px] checked:after:absolute 
						checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 
						checked:after:-translate-y-1/2"
          checked={task.completed || false}
          onChange={() => handleToggleComplete(task.id)}
        />
        <div
          onClick={() => onSelectName(task)}
          className={`font-bold text-center text-lg sm:text-[25px] break-words cursor-pointer ${
            task.completed
              ? "text-faint line-through"
              : "text-heading"
          }`}
        >
          {task.text}
        </div>

        <div className="mt-[4px]">
          <span className="inline-block relative cursor-pointer">
            📅
            <input
              type="date"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              value={task.deadline || ""}
              onClick={(e) => e.target.showPicker()}
              onChange={(e) =>
                handleUpdateTaskDeadline(task.id, e.target.value)
              }
            />
          </span>
          <span className="text-[0.85rem] text-danger ml-1">
            {task.deadline}
          </span>
          <RemainingTime targetDate={task.deadline} />
        </div>
      </div>

      <div>
        <PriorityDropdown
          currentPriority={task.priority || 4}
          onSelect={(newPriority) =>
            handleUpdateTaskPriority(task.id, newPriority)
          }
        />
        <button
          onClick={() => handleDeleteTask(task.id)}
          className="absolute top-[15px] right-[15px] bg-transparent border-none 
					text-muted text-[1.1rem] cursor-pointer p-[2px] leading-none transition-all 
					duration-200 z-10 hover:text-danger hover:bg-danger-soft"
        >
          ✕
        </button>
      </div>
    </li>
  );

  if (isDesktop) {
    return (
      <div
        className="pt-[75px] pb-[70px] min-h-screen px-4 sm:px-6"
        onClick={handleClose}
      >
        <div
          className="mx-auto max-w-6xl md:flex md:items-start md:gap-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="md:w-[380px] md:shrink-0">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-xl font-bold text-heading">All Tasks</h3>
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-full 
								bg-surface-muted text-base text-heading transition-all 
								duration-200 hover:bg-danger-soft hover:text-danger cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sortedTasks.length === 0 ? (
              <p className="text-heading text-[0.95rem] text-center py-2.5">
                No tasks added yet!
              </p>
            ) : (
              <ul className="list-none flex flex-col gap-2.5">
                {sortedTasks.map((task) =>
                  renderTaskItem(task, (t) => setSelectedTaskId(t.id)),
                )}
              </ul>
            )}
          </div>

          <div className="md:flex-1 md:sticky md:top-[100px]">
            <TaskDetails
              task={selectedTask}
              onUpdatePriority={handleUpdateTaskPriority}
              onUpdateDeadline={handleUpdateTaskDeadline}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onAddSubtask={handleAddSubtask}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 right-0 bottom-0 top-[75px] bg-transparent backdrop-blur-[16px] 
			backdrop-saturate-200 flex flex-col items-center z-[500] 
			animate-[fadeIn_0.25s_ease-out] py-[5vh] sm:py-[8vh] px-5"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[480px] mx-auto flex flex-col relative flex-1 min-h-0
					bg-surface-soft backdrop-blur-[25px] backdrop-saturate-[190%]
					border border-border rounded-3xl
					px-[15px] py-[18px] sm:px-5 sm:py-6
					shadow-card-lg
					animate-[scaleUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center w-full mb-3 px-1">
          <h3 className="text-xl font-bold text-heading">All Tasks</h3>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full 
						bg-surface-muted text-base text-heading transition-all 
						duration-200 hover:bg-danger-soft hover:text-danger cursor-pointer"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        <ul className="list-none flex flex-col gap-2.5 w-full max-w-full overflow-x-hidden mt-0.5 overflow-y-auto flex-1 min-h-0">
          {sortedTasks.length === 0 ? (
            <p className="text-heading text-[0.95rem] text-center py-2.5">
              No tasks added yet!
            </p>
          ) : (
            sortedTasks.map((task) =>
              renderTaskItem(task, (t) => router.push(`/task/${t.id}`)),
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;