import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectsWithProgress, createProject } from "@/lib/projects";

export async function GET(_request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const projects = await getProjectsWithProgress();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const project = await createProject({ name: body.name, description: body.description });
  return NextResponse.json(project, { status: 201 });
}
