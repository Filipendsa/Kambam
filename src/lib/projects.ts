import { db } from "./db";

export async function getProjectsWithProgress() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tasks: {
        select: { status: true },
      },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    totalTasks: p.tasks.length,
    doneTasks: p.tasks.filter((t) => t.status === "done").length,
  }));
}

export async function createProject(data: { name: string; description?: string }) {
  return db.project.create({ data });
}

export async function updateProject(
  id: string,
  data: { name?: string; description?: string }
) {
  return db.project.update({ where: { id }, data });
}

export async function deleteProject(id: string) {
  return db.project.delete({ where: { id } });
  // Cascade deletes tasks per schema onDelete: Cascade
}
