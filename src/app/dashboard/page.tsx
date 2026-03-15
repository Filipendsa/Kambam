"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ProjectCard from "@/components/projects/project-card";
import ProjectFormModal from "@/components/projects/project-form-modal";
import DeleteProjectDialog from "@/components/projects/delete-project-dialog";

type ProjectWithProgress = {
  id: string;
  name: string;
  description: string | null;
  totalTasks: number;
  doneTasks: number;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<ProjectWithProgress | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<ProjectWithProgress | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data);
    } catch {
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function handleEdit(project: ProjectWithProgress) {
    setEditingProject(project);
    setFormOpen(true);
  }

  function handleDelete(project: ProjectWithProgress) {
    setDeleteTarget(project);
  }

  function handleFormClose() {
    setFormOpen(false);
    setEditingProject(null);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral de todos os projetos da equipe
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground mb-4">
            Nenhum projeto criado ainda.
          </p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose();
          else setFormOpen(true);
        }}
        project={editingProject}
        onSuccess={() => {
          handleFormClose();
          fetchProjects();
        }}
      />

      {deleteTarget && (
        <DeleteProjectDialog
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          projectName={deleteTarget.name}
          projectId={deleteTarget.id}
          onSuccess={() => {
            setDeleteTarget(null);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
}
