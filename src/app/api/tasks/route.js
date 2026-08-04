import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTasksForUser, createTaskForUser } from "@/lib/tasks";

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestedUserId = new URL(request.url).searchParams.get("userId");
  if (requestedUserId && requestedUserId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can view other users' tasks" }, { status: 403 });
  }

  const tasks = getTasksForUser(requestedUserId || session.user.id);
  return NextResponse.json({ tasks });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body?.text || !body.text.trim()) {
    return NextResponse.json({ error: "Task text is required" }, { status: 400 });
  }

  if (body.userId && body.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Only admins can add tasks for other users" }, { status: 403 });
  }

  const task = createTaskForUser(body.userId || session.user.id, {
    text: body.text,
    priority: body.priority,
    deadline: body.deadline,
  });

  return NextResponse.json({ task }, { status: 201 });
}