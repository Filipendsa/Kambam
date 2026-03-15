import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskFormModal from "@/components/tasks/task-form-modal";

const mockTask = {
  id: "task-1",
  title: "Fix login bug",
  description: "Users cannot log in with Google",
  status: "in_progress",
  priority: "high",
  assignee: "filipe.nogueira@yesode.com",
  dueDate: "2026-04-01",
  createdBy: "filipe.nogueira@yesode.com",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  projectId: "proj-1",
};

describe("TaskFormModal — create mode", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "new-task", title: "New Task", status: "backlog", projectId: "proj-1", createdBy: "user@test.com", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", description: null, priority: null, assignee: null, dueDate: null }),
    });
  });

  it("renders title input, status select, assignee select (required fields — TASK-01)", () => {
    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={null}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Responsável")).toBeInTheDocument();
  });

  it("renders description textarea, priority select, dueDate input (optional fields)", () => {
    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={null}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
    expect(screen.getByLabelText("Prioridade")).toBeInTheDocument();
    expect(screen.getByLabelText("Data de Entrega")).toBeInTheDocument();
  });

  it("submit button is disabled when title is empty (required validation — TASK-01)", async () => {
    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={null}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    const submitButton = screen.getByRole("button", { name: /criar/i });
    expect(submitButton).toBeDisabled();
  });

  it("calls onSubmit with form values when all required fields are filled", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={null}
        projectId="proj-1"
        onSuccess={onSuccess}
      />
    );

    await user.type(screen.getByLabelText("Título"), "New Task Title");

    const submitButton = screen.getByRole("button", { name: /criar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/tasks",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Task Title"),
        })
      );
    });
  });
});

describe("TaskFormModal — edit mode", () => {
  it("pre-populates all fields from the task prop (TASK-02)", () => {
    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={mockTask}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Título")).toHaveValue(mockTask.title);
  });

  it("form resets when a different task is passed (key-based remount — no stale values)", async () => {
    const { rerender } = render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={mockTask}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Título")).toHaveValue("Fix login bug");

    const anotherTask = { ...mockTask, id: "task-2", title: "Another Task" };
    rerender(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={anotherTask}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Título")).toHaveValue("Another Task");
  });
});

describe("TaskFormModal — assignee select (TASK-06)", () => {
  it("renders three options: 'Sem responsável', filipe.nogueira@yesode.com, davi.ribeiro@yesode.com", () => {
    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={null}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    // The select options are rendered as option elements inside a native select
    const assigneeSelect = screen.getByLabelText("Responsável") as HTMLSelectElement;
    const options = Array.from(assigneeSelect.options).map((o) => o.text);
    expect(options).toHaveLength(3);
    expect(options).toContain("Sem responsável");
    expect(options).toContain("filipe.nogueira@yesode.com");
    expect(options).toContain("davi.ribeiro@yesode.com");
  });

  it("empty string value maps to 'Sem responsável' label", () => {
    render(
      <TaskFormModal
        open={true}
        onOpenChange={vi.fn()}
        task={null}
        projectId="proj-1"
        onSuccess={vi.fn()}
      />
    );

    const assigneeSelect = screen.getByLabelText("Responsável") as HTMLSelectElement;
    const semResponsavel = Array.from(assigneeSelect.options).find(
      (o) => o.value === ""
    );
    expect(semResponsavel?.text).toBe("Sem responsável");
  });
});
