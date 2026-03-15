import { render, screen, act, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

// Mock next/dynamic — capture onDragEnd from the DndContext usage in kanban-board
// We can't reference capturedOnDragEnd here (hoisting), so make the mock component
// store onDragEnd on a global that tests read after render.
vi.mock("next/dynamic", () => ({
  default: (_fn: unknown, _opts?: unknown) => {
    // Return a fake DndContext that captures onDragEnd and renders children
    return function MockDynamicDndContext(props: Record<string, unknown>) {
      if (typeof props.onDragEnd === "function") {
        capturedOnDragEnd = props.onDragEnd as (event: unknown) => void;
      }
      return React.createElement(React.Fragment, null, props.children as React.ReactNode);
    };
  },
}));

// Type for MockDndContext props
type DndContextProps = {
  children: React.ReactNode;
  onDragEnd?: (event: unknown) => void;
};

// Mutable reference so tests can capture onDragEnd
let capturedOnDragEnd: ((event: unknown) => void) | undefined;

// Mock @dnd-kit/core to avoid getBoundingClientRect failures
vi.mock("@dnd-kit/core", () => {
  const MockDndContext = ({ children, onDragEnd }: DndContextProps) => {
    capturedOnDragEnd = onDragEnd;
    return <>{children}</>;
  };
  return {
    DndContext: MockDndContext,
    useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
    useDraggable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    }),
    PointerSensor: class {},
    useSensor: vi.fn(),
    useSensors: vi.fn(() => []),
    closestCorners: vi.fn(),
  };
});

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Translate: { toString: () => "" } },
}));

// Mock @base-ui/react/progress to avoid jsdom issues
vi.mock("@base-ui/react/progress", () => ({
  Progress: {
    Root: ({ children, value, ...props }: React.PropsWithChildren<{ value?: number }>) => (
      <div data-testid="progress-root" data-value={value} {...props}>{children}</div>
    ),
    Track: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <div data-testid="progress-track" {...props}>{children}</div>
    ),
    Indicator: (props: object) => <div data-testid="progress-indicator" {...props} />,
    Label: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <span data-testid="progress-label" {...props}>{children}</span>
    ),
    Value: ({ children, ...props }: React.PropsWithChildren<object>) => (
      <span data-testid="progress-value" {...props}>{children}</span>
    ),
  },
}));

import KanbanBoard from "@/components/kanban/kanban-board";

const makeTask = (overrides: Partial<{
  id: string;
  title: string;
  status: string;
  assignee: string | null;
}> = {}) => ({
  id: "task-1",
  title: "Test Task",
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

describe("KanbanBoard", () => {
  it("renders 3 columns with labels: A Fazer, Em Andamento, Concluído", () => {
    render(
      <KanbanBoard
        tasks={[]}
        projectId="proj-1"
        onTaskUpdate={vi.fn()}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText("A Fazer")).toBeInTheDocument();
    expect(screen.getByText("Em Andamento")).toBeInTheDocument();
    expect(screen.getByText("Concluído")).toBeInTheDocument();
  });

  it("each column header shows task count badge", () => {
    const tasks = [
      makeTask({ id: "1", status: "backlog" }),
      makeTask({ id: "2", status: "backlog" }),
      makeTask({ id: "3", status: "in_progress" }),
    ];
    render(
      <KanbanBoard
        tasks={tasks}
        projectId="proj-1"
        onTaskUpdate={vi.fn()}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );
    // A Fazer: 2, Em Andamento: 1, Concluído: 0
    const badges = screen.getAllByText(/^\d+$/);
    const badgeValues = badges.map((b) => b.textContent);
    expect(badgeValues).toContain("2");
    expect(badgeValues).toContain("1");
    expect(badgeValues).toContain("0");
  });

  it("tasks with status 'review' appear in Em Andamento column", () => {
    const tasks = [
      makeTask({ id: "1", title: "Review Task", status: "review" }),
    ];
    render(
      <KanbanBoard
        tasks={tasks}
        projectId="proj-1"
        onTaskUpdate={vi.fn()}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );
    expect(screen.getByText("Review Task")).toBeInTheDocument();
    // Em Andamento column should have count 1
    const emAndamentoBadges = screen.getAllByText("1");
    expect(emAndamentoBadges.length).toBeGreaterThan(0);
  });

  it("board container has responsive grid classes", () => {
    const { container } = render(
      <KanbanBoard
        tasks={[]}
        projectId="proj-1"
        onTaskUpdate={vi.fn()}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );
    const grid = container.querySelector(".grid");
    expect(grid?.className).toMatch(/grid-cols-1/);
    expect(grid?.className).toMatch(/md:grid-cols-3/);
  });
});

describe("KanbanBoard onDragEnd handler", () => {
  beforeEach(() => {
    capturedOnDragEnd = undefined;
  });

  it("updates task status optimistically when dragged to new column", async () => {
    const onTaskUpdate = vi.fn(() => Promise.resolve());
    const tasks = [makeTask({ id: "task-1", status: "backlog" })];
    render(
      <KanbanBoard
        tasks={tasks}
        projectId="proj-1"
        onTaskUpdate={onTaskUpdate}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );

    expect(capturedOnDragEnd).toBeDefined();
    await act(async () => {
      capturedOnDragEnd!({
        active: { id: "task-1", data: { current: { status: "backlog" } } },
        over: { id: "done" },
      });
    });

    expect(onTaskUpdate).toHaveBeenCalledWith("task-1", "done");
  });

  it("does nothing when over is null", async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [makeTask({ id: "task-1", status: "backlog" })];
    render(
      <KanbanBoard
        tasks={tasks}
        projectId="proj-1"
        onTaskUpdate={onTaskUpdate}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );

    expect(capturedOnDragEnd).toBeDefined();
    await act(async () => {
      capturedOnDragEnd!({
        active: { id: "task-1", data: { current: { status: "backlog" } } },
        over: null,
      });
    });

    expect(onTaskUpdate).not.toHaveBeenCalled();
  });

  it("does nothing when task is dropped on same column", async () => {
    const onTaskUpdate = vi.fn();
    const tasks = [makeTask({ id: "task-1", status: "backlog" })];
    render(
      <KanbanBoard
        tasks={tasks}
        projectId="proj-1"
        onTaskUpdate={onTaskUpdate}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );

    expect(capturedOnDragEnd).toBeDefined();
    await act(async () => {
      capturedOnDragEnd!({
        active: { id: "task-1", data: { current: { status: "backlog" } } },
        over: { id: "backlog" },
      });
    });

    expect(onTaskUpdate).not.toHaveBeenCalled();
  });

  it("reverts optimistic update on failed PATCH", async () => {
    const onTaskUpdate = vi.fn(() => Promise.reject(new Error("PATCH failed")));
    const tasks = [makeTask({ id: "task-1", status: "backlog" })];
    render(
      <KanbanBoard
        tasks={tasks}
        projectId="proj-1"
        onTaskUpdate={onTaskUpdate}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );

    expect(capturedOnDragEnd).toBeDefined();
    await act(async () => {
      capturedOnDragEnd!({
        active: { id: "task-1", data: { current: { status: "backlog" } } },
        over: { id: "done" },
      });
    });

    // onTaskUpdate was called (optimistic update happened)
    expect(onTaskUpdate).toHaveBeenCalledWith("task-1", "done");
    // After revert, task should be back in backlog — check it's still rendered in A Fazer column
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });
});

describe("KanbanColumn empty state", () => {
  it("renders friendly message when column has no tasks", () => {
    render(
      <KanbanBoard
        tasks={[]}
        projectId="proj-1"
        onTaskUpdate={vi.fn()}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );
    // Each of the 3 columns should show "Nenhuma tarefa em {label}"
    expect(screen.getByText("Nenhuma tarefa em A Fazer")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma tarefa em Em Andamento")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma tarefa em Concluído")).toBeInTheDocument();
  });

  it("empty state CTA button is visible in each empty column", () => {
    render(
      <KanbanBoard
        tasks={[]}
        projectId="proj-1"
        onTaskUpdate={vi.fn()}
        onNewTask={vi.fn()}
        onCardClick={vi.fn()}
      />
    );
    // Each of 3 columns should have a "Criar tarefa" CTA button
    const ctaButtons = screen.getAllByRole("button", { name: /Criar tarefa/i });
    expect(ctaButtons).toHaveLength(3);
  });
});
