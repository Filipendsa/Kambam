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
        "flex flex-col min-h-full h-full pb-8",
        isOver && "ring-1 ring-white/20 rounded-2xl bg-white/[0.02]"
      )}
    >
      <div className="flex items-center justify-between mb-5 px-1 pb-4 border-b border-white/10">
        <h3 className="text-[14px] font-medium tracking-tight text-white/90 flex items-center gap-2">
          {label}
          <span className="text-[11px] font-medium text-white/50 bg-white/10 rounded-full px-2 py-0.5 min-w-5 text-center">
            {tasks.length}
          </span>
        </h3>
        
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full" onClick={onNewTask}>
            <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 px-1 flex-1 overflow-y-auto hide-scrollbar">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onClick={onCardClick} />
        ))}
        
        {tasks.length === 0 ? (
          <Button 
            variant="ghost" 
            onClick={onNewTask} 
            className="w-full h-32 border border-dashed border-white/10 text-zinc-500 hover:text-white hover:border-white/30 hover:bg-white/5 rounded-2xl justify-center flex-col gap-2 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium">Add task</span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            onClick={onNewTask} 
            className="w-full mt-2 text-zinc-500 hover:text-white hover:bg-white/5 justify-start text-xs font-medium h-10 rounded-xl transition-colors"
          >
              <Plus className="mr-2 h-4 w-4" />
              Add task
          </Button>
        )}
      </div>
    </div>
  );
}
