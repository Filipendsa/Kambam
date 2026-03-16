"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ASSIGNEE_OPTIONS } from "@/lib/constants";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    "Unassigned";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-xl border border-border/80 bg-background p-4 shadow-sm hover:shadow-md transition-all ease-in-out duration-150 cursor-grab hover:border-primary/20",
        isDragging && "opacity-50 cursor-grabbing shadow-lg border-primary/40 rotate-2 scale-105"
      )}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(task);
      }}
      {...attributes}
    >
      <div {...listeners} className="flex flex-col gap-3 min-w-0">
        <h4 className="text-[14px] font-medium leading-snug tracking-tight text-foreground truncate w-full" title={task.title}>
          {task.title}
        </h4>
        
        {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
            </p>
        )}

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border/40">
           <div className="flex gap-2 items-center text-xs">
              <span className="font-medium text-muted-foreground truncate max-w-[100px]">{assigneeLabel}</span>
           </div>
           
           <div className="flex gap-2 items-center">
             {task.dueDate && (
                <div className="flex items-center text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                   <Calendar className="mr-1 h-3 w-3" />
                   {new Date(task.dueDate).toLocaleDateString()}
                </div>
             )}
              {task.priority === "high" && <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider">High</Badge>}
              {task.priority === "medium" && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider text-orange-600 bg-orange-100 hover:bg-orange-200">Med</Badge>}
              {task.priority === "low" && <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Low</Badge>}
           </div>
        </div>
      </div>
    </div>
  );
}
