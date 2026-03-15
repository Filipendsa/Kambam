import { db } from "./db";

export async function getTasksByProject(projectId: string) {
  return db.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTask(data: {
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assignee?: string;
  dueDate?: string | null;
  createdBy: string;
  projectId: string;
}) {
  return db.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status ?? "backlog",
      priority: data.priority,
      assignee: data.assignee || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdBy: data.createdBy,
      projectId: data.projectId,
    },
  });
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee?: string;
    dueDate?: string | null;
  }
) {
  return db.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.assignee !== undefined && { assignee: data.assignee || null }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
    },
  });
}

export async function deleteTask(id: string) {
  return db.task.delete({ where: { id } });
}
