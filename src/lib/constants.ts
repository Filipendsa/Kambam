export const TASK_STATUSES = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "review", label: "Revisão" },
  { value: "done", label: "Concluído" },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export const TASK_PRIORITIES = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number]["value"];

export const ASSIGNEE_OPTIONS = [
  { value: "", label: "Sem responsável" },
  { value: "filipe.nogueira@yesode.com", label: "filipe.nogueira@yesode.com" },
  { value: "davi.ribeiro@yesode.com", label: "davi.ribeiro@yesode.com" },
] as const;

export const KANBAN_COLUMNS = [
  { value: "backlog",     label: "A Fazer" },
  { value: "in_progress", label: "Em Andamento" },
  { value: "done",        label: "Concluído" },
] as const;

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]["value"];
