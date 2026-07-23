import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTasksForUser, createTaskForUser } from "@/lib/tasks";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = getTasksForUser(session.user.id);
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

  const task = createTaskForUser(session.user.id, {
    text: body.text,
    priority: body.priority,
    deadline: body.deadline,
  });

  return NextResponse.json({ task }, { status: 201 });
}