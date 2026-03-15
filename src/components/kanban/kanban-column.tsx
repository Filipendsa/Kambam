"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import KanbanCard from "./kanban-card";

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

interface KanbanColumnProps {
  id: string;
  label: string;
  tasks: Task[];
  onCardClick: (t: Task) => void;
  onNewTask: () => void;
}

export default function KanbanColumn({
  id,
  label,
  tasks,
  onCardClick,
  onNewTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-lg bg-muted/40 p-3 min-h-[200px]",
        isOver && "bg-muted/70 ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-6 text-center gap-2">
          <p className="text-xs text-muted-foreground">
            Nenhuma tarefa em {label}
          </p>
          <Button variant="ghost" size="sm" onClick={onNewTask}>
            <Plus className="mr-1 h-3 w-3" />
            Criar tarefa
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onCardClick} />
          ))}
        </div>
      )}
    </div>
  );
}
