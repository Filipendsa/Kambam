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

const projectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type ProjectWithProgress = {
  id: string;
  name: string;
  description: string | null;
  totalTasks: number;
  doneTasks: number;
};

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectWithProgress | null;
  onSuccess: () => void;
}

export default function ProjectFormModal({
  open,
  onOpenChange,
  project,
  onSuccess,
}: ProjectFormModalProps) {
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    // key-equivalent: reset when project changes (RESEARCH.md Pitfall 3)
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  // Sync form values when project prop changes (edit vs create mode)
  useEffect(() => {
    reset({
      name: project?.name ?? "",
      description: project?.description ?? "",
    });
  }, [project, reset]);

  const nameValue = watch("name");
  const isSubmitDisabled = isSubmitting || !nameValue || nameValue.trim() === "";

  async function onSubmit(values: ProjectFormValues) {
    try {
      const url = isEditing
        ? `/api/projects/${project!.id}`
        : "/api/projects";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          ...(values.description ? { description: values.description } : {}),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(
        isEditing ? "Projeto atualizado com sucesso" : "Projeto criado com sucesso"
      );
      onSuccess();
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? "Erro ao atualizar projeto" : "Erro ao criar projeto"
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Projeto" : "Novo Projeto"}
          </DialogTitle>
        </DialogHeader>

        <form
          key={project?.id ?? "new"}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="project-name"
              className="text-sm font-medium leading-none"
            >
              Nome <span className="text-destructive">*</span>
            </label>
            <Input
              id="project-name"
              placeholder="Nome do projeto"
              aria-label="Nome"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="project-description"
              className="text-sm font-medium leading-none text-muted-foreground"
            >
              Descrição
            </label>
            <Textarea
              id="project-description"
              placeholder="Descrição opcional do projeto"
              rows={3}
              aria-label="Descrição"
              {...register("description")}
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
