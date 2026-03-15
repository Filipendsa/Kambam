import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteTaskDialog from "@/components/tasks/delete-task-dialog";

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

describe("DeleteTaskDialog", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it("renders AlertDialog with cancel and confirm buttons (TASK-03)", () => {
    render(
      <DeleteTaskDialog
        open={true}
        onOpenChange={vi.fn()}
        task={mockTask}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /excluir/i })).toBeInTheDocument();
  });

  it("calls onSuccess callback when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <DeleteTaskDialog
        open={true}
        onOpenChange={vi.fn()}
        task={mockTask}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole("button", { name: /excluir/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it("does NOT call onSuccess when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    render(
      <DeleteTaskDialog
        open={true}
        onOpenChange={vi.fn()}
        task={mockTask}
        onSuccess={onSuccess}
      />
    );

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("displays task title in the confirmation message", () => {
    render(
      <DeleteTaskDialog
        open={true}
        onOpenChange={vi.fn()}
        task={mockTask}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText(/Fix login bug/)).toBeInTheDocument();
  });
});
