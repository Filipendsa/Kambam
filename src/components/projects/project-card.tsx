"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type ProjectWithProgress = {
  id: string;
  name: string;
  description: string | null;
  totalTasks: number;
  doneTasks: number;
};

interface ProjectCardProps {
  project: ProjectWithProgress;
  onEdit: (project: ProjectWithProgress) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const progress = Math.round(
    (project.doneTasks / Math.max(project.totalTasks, 1)) * 100
  );

  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <Link
        href={`/dashboard/projects/${project.id}`}
        className="block p-5"
      >
        <div className="mb-3">
          <h3 className="font-semibold text-base leading-tight line-clamp-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{project.doneTasks}/{project.totalTasks} tarefas concluídas</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </Link>

      {/* Action buttons — outside Link to prevent nested anchors */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-pointer"
          aria-label={`Editar ${project.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(project);
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 cursor-pointer text-destructive hover:text-destructive"
          aria-label={`Excluir ${project.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(project.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
