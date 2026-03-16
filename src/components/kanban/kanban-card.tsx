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

  const assigneeImage =
    ASSIGNEE_OPTIONS.find((a) => a.value === (task.assignee ?? ""))?.label?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-2xl border border-white/5 bg-zinc-950 p-5 cursor-grab transition-all duration-300 ease-out hover:border-white/20 hover:bg-zinc-900 group",
        isDragging && "opacity-50 cursor-grabbing scale-[1.02] border-white/30 rotate-1 shadow-2xl z-50 bg-[#0a0a0a]"
      )}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick(task);
      }}
      {...attributes}
    >
      <div {...listeners} className="flex flex-col min-w-0">
        <h4 className="text-[15px] font-medium leading-[1.3] text-white/90 group-hover:text-white transition-colors" title={task.title}>
          {task.title}
        </h4>
        
        {task.description && (
            <p className="text-[13px] text-zinc-500 line-clamp-2 leading-relaxed mt-2 font-normal">
              {task.description}
            </p>
        )}

        <div className="flex items-center justify-between mt-5">
           <div className="flex gap-2 items-center">
             {task.dueDate && (
                <div className="flex items-center text-[11px] font-medium text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                   <Calendar className="mr-1.5 h-3 w-3 opacity-70" />
                   {new Date(task.dueDate).toLocaleDateString()}
                </div>
             )}
              {task.priority === "high" && <div className="h-6 px-2.5 flex items-center bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[11px] font-medium tracking-wide">High</div>}
              {task.priority === "medium" && <div className="h-6 px-2.5 flex items-center bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[11px] font-medium tracking-wide">Med</div>}
              {task.priority === "low" && <div className="h-6 px-2.5 flex items-center bg-white/5 border border-white/10 text-zinc-400 rounded-full text-[11px] font-medium tracking-wide">Low</div>}
           </div>

           {/** Avatar Circular */}
           <div className="flex -space-x-2">
              <div className="h-7 w-7 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10">
                 {assigneeImage}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
