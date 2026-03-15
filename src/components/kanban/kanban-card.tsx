"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ASSIGNEE_OPTIONS } from "@/lib/constants";

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

interface KanbanCardProps {
  task: Task;
  onClick: (t: Task) => void;
}

export default function KanbanCard({ task, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { status: task.status },
    });

  const assigneeLabel =
    ASSIGNEE_OPTIONS.find((a) => a.value === (task.assignee ?? ""))?.label ??
    "Sem responsável";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-md border bg-card p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50 cursor-grabbing"
      )}
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(task);
      }}
      {...attributes}
    >
      {/* Drag listeners on inner div to separate drag from click */}
      <div {...listeners}>
        <p className="text-sm font-medium leading-tight line-clamp-2">
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{assigneeLabel}</p>
      </div>
    </div>
  );
}
