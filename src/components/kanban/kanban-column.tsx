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
        "flex flex-col min-h-[400px] h-full",
        isOver && "ring-2 ring-primary/30 rounded-lg bg-muted/20"
      )}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-2">
          {label}
          <span className="text-xs font-medium text-muted-foreground bg-secondary/50 rounded-full px-2 py-0.5 min-w-5 text-center">
            {tasks.length}
          </span>
        </h3>
        
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onNewTask}>
            <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center gap-3 border-2 border-dashed border-muted/50 rounded-xl bg-muted/10 mx-1">
          <p className="text-sm font-medium text-muted-foreground">
            No tasks
          </p>
          <Button variant="outline" size="sm" onClick={onNewTask} className="h-8 shadow-sm">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 px-1">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} onClick={onCardClick} />
          ))}
          <Button variant="ghost" onClick={onNewTask} className="w-full mt-2 text-muted-foreground hover:text-foreground justify-start text-xs font-medium h-8">
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add task
          </Button>
        </div>
      )}
    </div>
  );
}
