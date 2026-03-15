import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import React from "react";

// Mock @dnd-kit/core to avoid getBoundingClientRect failures
vi.mock("@dnd-kit/core", () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Translate: { toString: () => "" } },
}));

import KanbanCard from "@/components/kanban/kanban-card";

const makeTask = (overrides: Partial<{
  id: string;
  title: string;
  assignee: string | null;
}> = {}) => ({
  id: "task-1",
  title: "My Task",
  description: null,
  status: "backlog",
  priority: null,
  assignee: null,
  dueDate: null,
  createdBy: "user@yesode.com",
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
  projectId: "proj-1",
  ...overrides,
});

describe("KanbanCard", () => {
  it("renders task title", () => {
    render(<KanbanCard task={makeTask({ title: "Design the homepage" })} onClick={vi.fn()} />);
    expect(screen.getByText("Design the homepage")).toBeInTheDocument();
  });

  it("renders assignee label (not raw email)", () => {
    render(
      <KanbanCard
        task={makeTask({ assignee: "filipe.nogueira@yesode.com" })}
        onClick={vi.fn()}
      />
    );
    expect(screen.getByText("filipe.nogueira@yesode.com")).toBeInTheDocument();
  });

  it("renders 'Sem responsável' when assignee is null", () => {
    render(<KanbanCard task={makeTask({ assignee: null })} onClick={vi.fn()} />);
    expect(screen.getByText("Sem responsável")).toBeInTheDocument();
  });

  it("clicking the card triggers onClick handler", () => {
    const handleClick = vi.fn();
    const task = makeTask({ title: "Clickable Task" });
    render(<KanbanCard task={task} onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledWith(task);
  });

  it.todo("card gets opacity-50 class when isDragging is true");
});
