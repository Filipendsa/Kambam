"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TASK_STATUSES, ASSIGNEE_OPTIONS, TASK_PRIORITIES } from "@/lib/constants";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string | null;
  assignee: string | null;
  dueDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: string) => void;
}

function getStatusBadgeProps(status: string) {
  switch (status) {
    case "done":
      return { variant: "default" as const, className: "bg-green-600 text-white" };
    case "in_progress":
      return { variant: "default" as const, className: "" };
    case "review":
      return { variant: "outline" as const, className: "" };
    default:
      return { variant: "secondary" as const, className: "" };
  }
}

function getPriorityBadgeProps(priority: string) {
  switch (priority) {
    case "high":
      return { variant: "destructive" as const };
    case "medium":
      return { variant: "default" as const };
    default:
      return { variant: "secondary" as const };
  }
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const statusLabel =
    TASK_STATUSES.find((s) => s.value === task.status)?.label ?? task.status;
  const assigneeLabel =
    ASSIGNEE_OPTIONS.find((a) => a.value === (task.assignee ?? ""))?.label ?? "Sem responsável";
  const priorityLabel =
    task.priority
      ? TASK_PRIORITIES.find((p) => p.value === task.priority)?.label
      : null;

  const statusBadgeProps = getStatusBadgeProps(task.status);
  const priorityBadgeProps = task.priority ? getPriorityBadgeProps(task.priority) : null;

  return (
    <div className="flex items-start justify-between rounded-lg border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-sm truncate">{task.title}</span>
          <Badge {...statusBadgeProps}>{statusLabel}</Badge>
          {priorityBadgeProps && priorityLabel && (
            <Badge {...priorityBadgeProps}>{priorityLabel}</Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-2">{assigneeLabel}</p>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {task.description}
          </p>
        )}

        {/* Quick status change */}
        <div className="mt-2">
          <select
            aria-label="Mudar status"
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
            className="text-xs rounded border border-input bg-background px-2 py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-3 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer hover:bg-accent"
          aria-label="Editar tarefa"
          onClick={() => onEdit(task)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
          aria-label="Excluir tarefa"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
