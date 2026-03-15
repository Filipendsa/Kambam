"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import KanbanBoard from "@/components/kanban/kanban-board";
import TaskFormModal from "@/components/tasks/task-form-modal";
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog";

// Task type — mirrors API response
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

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?projectId=${id}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      setTasks(await res.json());
    } catch {
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleStatusChange(task: Task, newStatus: string) {
    const previousStatus = task.status;
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Status atualizado");
      // Confetti when moving to "done" (locked decision from CONTEXT.md)
      if (previousStatus !== "done" && newStatus === "done") {
        const confetti = (await import("canvas-confetti")).default;
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }
    } catch {
      // Revert optimistic update on error
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: previousStatus } : t))
      );
      toast.error("Erro ao atualizar status");
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" aria-label="Voltar para projetos">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
            <p className="text-sm text-muted-foreground">
              Todas as tarefas deste projeto
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <KanbanBoard
          tasks={tasks}
          projectId={id}
          onTaskUpdate={async (taskId, newStatus) => {
            const task = tasks.find((t) => t.id === taskId);
            if (task) await handleStatusChange(task, newStatus);
          }}
          onNewTask={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
          onCardClick={(task) => {
            setEditingTask(task);
            setFormOpen(true);
          }}
        />
      )}

      <TaskFormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            setEditingTask(null);
          } else {
            setFormOpen(true);
          }
        }}
        task={editingTask}
        projectId={id}
        onSuccess={() => {
          setFormOpen(false);
          setEditingTask(null);
          fetchTasks();
        }}
      />

      {deleteTarget && (
        <DeleteTaskDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          task={deleteTarget}
          onSuccess={() => {
            setDeleteTarget(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}
