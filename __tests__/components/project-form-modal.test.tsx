import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectFormModal from "@/components/projects/project-form-modal";

const mockProject = {
  id: "proj-1",
  name: "Test Project",
  description: "A test description",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  totalTasks: 5,
  doneTasks: 2,
};

describe("ProjectFormModal — create mode", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "new-proj", name: "My Project" }),
    });
  });

  it("renders name input (required) and description textarea (optional)", () => {
    render(
      <ProjectFormModal
        open={true}
        onOpenChange={vi.fn()}
        project={null}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
  });

  it("submit button is disabled when name is empty", async () => {
    render(
      <ProjectFormModal
        open={true}
        onOpenChange={vi.fn()}
        project={null}
        onSuccess={vi.fn()}
      />
    );

    const submitButton = screen.getByRole("button", { name: /criar/i });
    expect(submitButton).toBeDisabled();
  });

  it("calls fetch with correct body when name is filled and form submitted", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();

    render(
      <ProjectFormModal
        open={true}
        onOpenChange={vi.fn()}
        project={null}
        onSuccess={onSuccess}
      />
    );

    const nameInput = screen.getByLabelText("Nome");
    await user.type(nameInput, "New Project");

    const submitButton = screen.getByRole("button", { name: /criar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Project"),
        })
      );
    });
  });
});

describe("ProjectFormModal — edit mode", () => {
  it("pre-populates name and description from the project prop", () => {
    render(
      <ProjectFormModal
        open={true}
        onOpenChange={vi.fn()}
        project={mockProject}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Nome")).toHaveValue(mockProject.name);
    expect(screen.getByLabelText("Descrição")).toHaveValue(
      mockProject.description
    );
  });
});
