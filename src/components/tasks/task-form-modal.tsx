"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  TASK_STATUSES,
  ASSIGNEE_OPTIONS,
  TASK_PRIORITIES,
} from "@/lib/constants";

const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.string(),
  assignee: z.string(),
  priority: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

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

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  projectId: string;
  onSuccess: (updatedTask?: Task) => void;
}

export default function TaskFormModal({
  open,
  onOpenChange,
  task,
  projectId,
  onSuccess,
}: TaskFormModalProps) {
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "backlog",
      assignee: task?.assignee ?? "",
      priority: task?.priority ?? "",
      dueDate: task?.dueDate ?? "",
    },
  });

  // Sync form values when task prop changes (edit vs create mode switch)
  useEffect(() => {
    reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "backlog",
      assignee: task?.assignee ?? "",
      priority: task?.priority ?? "",
      dueDate: task?.dueDate ?? "",
    });
  }, [task, reset]);

  const titleValue = watch("title");
  const isSubmitDisabled = isSubmitting || !titleValue || titleValue.trim() === "";

  async function onSubmit(values: TaskFormValues) {
    try {
      const url = isEditing ? `/api/tasks/${task!.id}` : "/api/tasks";
      const method = isEditing ? "PATCH" : "POST";

      const body = isEditing
        ? {
            title: values.title,
            ...(values.description ? { description: values.description } : {}),
            status: values.status,
            assignee: values.assignee,
            ...(values.priority ? { priority: values.priority } : {}),
            ...(values.dueDate ? { dueDate: values.dueDate } : {}),
          }
        : {
            title: values.title,
            ...(values.description ? { description: values.description } : {}),
            status: values.status,
            assignee: values.assignee,
            ...(values.priority ? { priority: values.priority } : {}),
            ...(values.dueDate ? { dueDate: values.dueDate } : {}),
            projectId,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Request failed");

      const responseData: Task = await res.json();
      toast.success(isEditing ? "Tarefa atualizada" : "Tarefa criada");
      onSuccess(responseData);
      onOpenChange(false);
    } catch {
      toast.error(isEditing ? "Erro ao atualizar tarefa" : "Erro ao criar tarefa");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <form
          key={task?.id ?? "new"}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {/* Title (required) */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium leading-none">
              Título <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              placeholder="Título da tarefa"
              aria-label="Título"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label htmlFor="task-status" className="text-sm font-medium leading-none">
              Status
            </label>
            <select
              id="task-status"
              aria-label="Status"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("status")}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label htmlFor="task-assignee" className="text-sm font-medium leading-none">
              Responsável
            </label>
            <select
              id="task-assignee"
              aria-label="Responsável"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("assignee")}
            >
              {ASSIGNEE_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="task-priority" className="text-sm font-medium leading-none text-muted-foreground">
              Prioridade
            </label>
            <select
              id="task-priority"
              aria-label="Prioridade"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("priority")}
            >
              <option value="">Sem prioridade</option>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium leading-none text-muted-foreground">
              Descrição
            </label>
            <Textarea
              id="task-description"
              placeholder="Descrição opcional"
              rows={3}
              aria-label="Descrição"
              {...register("description")}
            />
          </div>

          {/* Due Date (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="task-duedate" className="text-sm font-medium leading-none text-muted-foreground">
              Data de Entrega
            </label>
            <input
              id="task-duedate"
              type="date"
              aria-label="Data de Entrega"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...register("dueDate")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting
                ? isEditing
                  ? "Salvando..."
                  : "Criando..."
                : isEditing
                ? "Salvar"
                : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
