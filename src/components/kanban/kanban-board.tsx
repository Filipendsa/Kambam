"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { KANBAN_COLUMNS } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import KanbanColumn from "./kanban-column";

const DndContext = dynamic(
  () => import("@dnd-kit/core").then((m) => m.DndContext),
  { ssr: false }
);

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

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onTaskUpdate: (taskId: string, newStatus: string) => Promise<void>;
  onNewTask: () => void;
  onCardClick: (t: Task) => void;
}

function getColumnTasks(tasks: Task[], columnId: string): Task[] {
  if (columnId === "in_progress") {
    return tasks.filter(
      (t) => t.status === "in_progress" || t.status === "review"
    );
  }
  return tasks.filter((t) => t.status === columnId);
}

export default function KanbanBoard({
  tasks,
  onTaskUpdate,
  onNewTask,
  onCardClick,
}: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const totalTasks = localTasks.length;
  const doneTasks = localTasks.filter((t) => t.status === "done").length;
  const progress =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as string;
    const task = localTasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const previousStatus = task.status;
    // Optimistic update
    setLocalTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await onTaskUpdate(taskId, newStatus);
    } catch {
      // Revert on error
      setLocalTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: previousStatus } : t
        )
      );
    }
  }

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-8 bg-background overflow-hidden relative selection:bg-white/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <Progress value={progress} aria-label="Progresso das tarefas" className="h-1 bg-white/10 [&>div]:bg-white" />
        </div>
        <span className="text-xs font-medium text-zinc-500 tracking-wide uppercase">
          {doneTasks}/{totalTasks} Completed
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
          {KANBAN_COLUMNS.map((col) => (
            <div key={col.value} className="snap-start min-w-[340px] shrink-0 h-full">
               <KanbanColumn
                id={col.value}
                label={col.label}
                tasks={getColumnTasks(localTasks, col.value)}
                onCardClick={onCardClick}
                onNewTask={onNewTask}
              />
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
