"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PriorityDropdown from "@/components/PriorityDropdown";
import RemainingTime from "@/components/RemainingTime";
import { TOPBAR_HEIGHT } from "@/components/topbar";

const AddTask = () => {
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [selectedPriority, setSelectedPriority] = useState(4);
	const [deadline, setDeadline] = useState(null);
	const [tasks, setTasks] = useState([]);

	// Load persisted tasks on mount (client-only, avoids SSR/hydration mismatch)
	useEffect(() => {
		const storedTasks = localStorage.getItem("todo_tasks");
		if (storedTasks) {
			setTasks(JSON.parse(storedTasks));
		}
	}, []);

	useEffect(() => {
		localStorage.setItem("todo_tasks", JSON.stringify(tasks));
		window.dispatchEvent(new Event("todo_tasks_updated"));
	}, [tasks]);

	const handleClose = () => {
		router.push("/");
	};

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleAddTask = (e) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const newTask = {
			id: Date.now(),
			text: inputValue,
			priority: selectedPriority,
			completed: false,
			deadline,
		};

		setTasks([...tasks, newTask]);
		setInputValue("");
		setSelectedPriority(4);
		setDeadline(null);
	};

	const handleDeleteTask = (idToDelete) => {
		setTasks(tasks.filter((task) => task.id !== idToDelete));
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

	const sortedTasks = [...tasks].sort(
		(a, b) => Number(a.completed || false) - Number(b.completed || false),
	);

	return (
		<>
		<div className="fixed left-0 right-0 bottom-0 bg-transparent backdrop-blur-[16px] 
			backdrop-saturate-200 flex flex-col items-center z-[500] 
			animate-[fadeIn_0.25s_ease-out] py-[5vh] sm:py-[8vh] px-5"
			style={{ top: TOPBAR_HEIGHT }}
			onClick={handleClose}>
			<div
				className="w-full max-w-[480px] mx-auto flex flex-col relative flex-1 min-h-0
					bg-transparent backdrop-blur-[25px] backdrop-saturate-[190%]
					border border-white/15 rounded-3xl
					px-[15px] py-[18px] sm:px-5 sm:py-6
					shadow-[0_30px_60px_rgba(0,0,0,0.35)]
					animate-[scaleUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex justify-between items-center w-full mb-3 px-1">
					<h3 className="text-xl font-bold text-[#dae5f4]">Add Task</h3>
					<button className="flex h-8 w-8 items-center justify-center rounded-full 
						bg-black/[0.04] text-base text-[var(--text-main)] transition-all 
						duration-200 hover:bg-red-500/15 hover:text-red-500 cursor-pointer" onClick={handleClose}>
						✕
					</button>
				</div>

				<form onSubmit={handleAddTask} className="w-full max-w-full bg-transparent border-none p-0 shadow-none relative flex flex-col gap-3 my-2.5">
					<input
						type="text"
						placeholder="Enter a new task..."
						value={inputValue}
						onChange={handleInputChange}
						className="flex-1 px-4 py-3 rounded-xl border border-black/10 bg-white/50
							text-base text-[var(--text-main)] outline-none transition-all duration-200
							focus:bg-white focus:border-[var(--apple-blue)]
							focus:shadow-[0_0_0_4px_rgba(0,113,227,0.15)]"
					/>
					<div className="flex items-center gap-2">
						<span className="inline-block relative text-[2rem] cursor-pointer">
							📅
							<input
								type="date"
								className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
								value={deadline || ""}
								onClick={(e) => e.target.showPicker()}
								onChange={(e) => setDeadline(e.target.value)}
							/>
						</span>
						{deadline ? (
							<span className="text-sm text-[#ff6565] font-semibold">{deadline}</span>
						) : (
							<span className="text-sm text-slate-400">No deadline set</span>
						)}
					</div>
					<div className="flex justify-between items-center">
						<div className="flex items-center gap-2 relative bottom-auto right-auto">
							<PriorityDropdown
								currentPriority={selectedPriority}
								onSelect={setSelectedPriority}
							/>
							<span className="flex justify-between items-center">Priority</span>
						</div>
						<button
							type="submit"
							className="bg-[var(--apple-blue)] text-white border-none px-[22px] py-3 rounded-xl
								font-medium text-[0.95rem] cursor-pointer transition-colors duration-200
								hover:bg-[var(--apple-blue-hover)] active:scale-[0.97]"
						>
							Add Task
						</button>
					</div>
				</form>

				<ul className="list-none flex flex-col gap-2.5 w-full max-w-full overflow-x-hidden mt-0.5 overflow-y-auto flex-1 min-h-0">
					{sortedTasks.map((task) => (
						<li
							key={task.id}
							className={
								`flex items-center justify-center relative p-[20px_55px] 
								sm:p-[20px_55px] p-[16px_45px] mb-3.5 rounded-2xl min-h-[95px] 
								sm:min-h-[95px] min-h-[80px] bg-transparent backdrop-blur-xl backdrop-saturate-200 
								border border-white/45 
								shadow-[0_20px_40px_rgba(0,0,0,0.07),0_6px_12px_rgba(0,0,0,0.03),
								inset_1px_1px_1px_rgba(255,255,255,0.65),inset_-1px_-1px_2px_rgba(0,0,0,0.1)] 
								transition-[transform,background-color,box-shadow] duration-300 
								ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 
								hover:bg-white/32 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12),
								0_12px_20px_rgba(0,0,0,0.05),inset_1px_1px_2px_rgba(255,255,255,0.8),
								inset_-1px_-1px_2px_rgba(0,0,0,0.05)]
								${task.completed 
								? `opacity-40 !bg-[rgba(225,225,225,0.05)] !border-white/10 
								!shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] !transform-none line-through text-[#888]` 
								: ""
							}`
							}
						>
							<div className="flex flex-col items-center justify-center flex-1">
								<input
									type="checkbox"
									className="absolute left-5 top-1/2 -translate-y-1/2 appearance-none w-5 
										h-5 border-2 border-[#aaa] rounded-full cursor-pointer transition-all 
										duration-200 shrink-0 checked:bg-[var(--apple-blue,#0071e3)] 
										checked:border-[var(--apple-blue,#0071e3)] checked:after:content-['✓'] 
										checked:after:text-white checked:after:text-[14px] checked:after:absolute 
										checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 
										checked:after:-translate-y-1/2"
									checked={task.completed || false}
									onChange={() => handleToggleComplete(task.id)}
								/>
								<div className={`font-bold text-center text-lg sm:text-[25px] break-words ${
									task.completed ? "text-[#888] line-through [text-shadow:0_1px_1px_rgba(246,165,165,0.4)]" : "text-[#dae5f4]"
								}`}>
									{task.text}</div>

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
									<span className="text-[0.85rem] text-[#ff6565] ml-1">{task.deadline}</span>
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
									text-[#e0d5d5] text-[1.1rem] cursor-pointer p-[2px] leading-none transition-all 
									duration-200 z-10 hover:text-[#ef4444] hover:bg-[#ef4444]/[0.08]"
								>
									✕
								</button>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
		</>
	);
};

export default AddTask;