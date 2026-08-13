import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTasksForUser, createTaskForUser } from "@/lib/tasks";
import { touchDeviceLastActive } from "@/lib/devices";

export async function GET(request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  touchDeviceLastActive(session.user.deviceId);

  const { searchParams } = new URL(request.url);
  const requestedUserId = searchParams.get("userId");

  let targetUserId = session.user.id;
  if (requestedUserId && requestedUserId !== session.user.id) {
    const canViewAll = session.user.permissions?.includes("tasks:view_all");
    if (!canViewAll) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    targetUserId = requestedUserId;
  }

  const tasks = getTasksForUser(targetUserId);
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

  let targetUserId = session.user.id;
  if (body.userId && body.userId !== session.user.id) {
    const canViewAll = session.user.permissions?.includes("tasks:view_all");
    if (!canViewAll) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    targetUserId = body.userId;
  }

  const task = createTaskForUser(targetUserId, {
    text: body.text,
    priority: body.priority,
    deadline: body.deadline,
  });

  touchDeviceLastActive(session.user.deviceId);

  return NextResponse.json({ task }, { status: 201 });
}