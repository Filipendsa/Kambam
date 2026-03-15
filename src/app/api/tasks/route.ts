import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTasksByProject, createTask } from "@/lib/tasks";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  const tasks = await getTasksByProject(projectId);
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const task = await createTask({
    ...body,
    createdBy: session.user.email, // TASK-05: never from body
  });
  return NextResponse.json(task, { status: 201 });
}
