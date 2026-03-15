import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "@/app/api/tasks/route";
import { PATCH, DELETE } from "@/app/api/tasks/[id]/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock auth and db
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { email: "filipe.nogueira@yesode.com" } }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    task: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockedAuth = vi.mocked(auth);
const mockedDb = vi.mocked(db, true);

function makePostRequest(body?: object, url = "http://localhost/api/tasks") {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function makeGetRequest(url: string) {
  return new Request(url, { method: "GET" });
}

function makePatchRequest(body: object, url: string) {
  return new Request(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest(url: string) {
  return new Request(url, { method: "DELETE" });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedAuth.mockResolvedValue({ user: { email: "filipe.nogueira@yesode.com" } } as Awaited<ReturnType<typeof auth>>);
});

describe("POST /api/tasks", () => {
  it("creates task with required fields (title, status, assignee) and returns 201", async () => {
    const created = {
      id: "task-1",
      title: "Test Task",
      status: "backlog",
      assignee: "alice",
      createdBy: "filipe.nogueira@yesode.com",
      projectId: "proj-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.task.create.mockResolvedValue(created as never);

    const req = makePostRequest({
      title: "Test Task",
      status: "backlog",
      assignee: "alice",
      projectId: "proj-1",
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.title).toBe("Test Task");
  });

  it("populates createdBy from session.user.email — not from request body (TASK-05)", async () => {
    const created = {
      id: "task-2",
      title: "T",
      createdBy: "filipe.nogueira@yesode.com",
      projectId: "proj-1",
      status: "backlog",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.task.create.mockResolvedValue(created as never);

    const req = makePostRequest({
      title: "T",
      status: "backlog",
      createdBy: "hacker@evil.com", // should be ignored
      projectId: "proj-1",
    });
    await POST(req);

    expect(mockedDb.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          createdBy: "filipe.nogueira@yesode.com",
        }),
      })
    );
  });

  it("sets createdAt automatically via Prisma @default(now()) (TASK-05)", async () => {
    const created = {
      id: "task-3",
      title: "T",
      createdBy: "filipe.nogueira@yesode.com",
      projectId: "proj-1",
      status: "backlog",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.task.create.mockResolvedValue(created as never);

    const req = makePostRequest({ title: "T", status: "backlog", projectId: "proj-1" });
    const res = await POST(req);

    // createdAt is NOT sent in the create call — Prisma sets it via @default(now())
    expect(mockedDb.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.not.objectContaining({ createdAt: expect.anything() }),
      })
    );
    expect(res.status).toBe(201);
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makePostRequest({ title: "T", projectId: "proj-1" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when title is missing", async () => {
    const req = makePostRequest({ status: "backlog", projectId: "proj-1" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/title/i);
  });

  it("accepts null/empty assignee for 'Sem responsável' (TASK-06)", async () => {
    const created = {
      id: "task-4",
      title: "T",
      assignee: null,
      createdBy: "filipe.nogueira@yesode.com",
      projectId: "proj-1",
      status: "backlog",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.task.create.mockResolvedValue(created as never);

    const req = makePostRequest({
      title: "T",
      status: "backlog",
      assignee: "",
      projectId: "proj-1",
    });
    await POST(req);

    expect(mockedDb.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ assignee: null }),
      })
    );
  });
});

describe("GET /api/tasks", () => {
  it("returns array of tasks for a given projectId query param (TASK-04)", async () => {
    const tasks = [
      { id: "t1", title: "Task 1", projectId: "proj-1", status: "backlog" },
      { id: "t2", title: "Task 2", projectId: "proj-1", status: "done" },
    ];
    mockedDb.task.findMany.mockResolvedValue(tasks as never);

    const req = makeGetRequest("http://localhost/api/tasks?projectId=proj-1");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(mockedDb.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { projectId: "proj-1" } })
    );
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makeGetRequest("http://localhost/api/tasks?projectId=proj-1");
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/tasks/[id]", () => {
  it("updates only the fields provided in the request body (TASK-02)", async () => {
    const updated = {
      id: "task-1",
      title: "Updated",
      status: "in_progress",
      createdBy: "filipe.nogueira@yesode.com",
      projectId: "proj-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.task.update.mockResolvedValue(updated as never);

    const req = makePatchRequest(
      { status: "in_progress" },
      "http://localhost/api/tasks/task-1"
    );
    const res = await PATCH(req, { params: Promise.resolve({ id: "task-1" }) });

    expect(res.status).toBe(200);
    expect(mockedDb.task.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "task-1" } })
    );
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makePatchRequest({ status: "done" }, "http://localhost/api/tasks/task-1");
    const res = await PATCH(req, { params: Promise.resolve({ id: "task-1" }) });

    expect(res.status).toBe(401);
  });

  it("returns 404 when task does not exist", async () => {
    mockedDb.task.update.mockRejectedValue(new Error("Record not found"));

    const req = makePatchRequest(
      { status: "done" },
      "http://localhost/api/tasks/nonexistent"
    );
    const res = await PATCH(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/[id]", () => {
  it("deletes task and returns 200 (TASK-03)", async () => {
    mockedDb.task.delete.mockResolvedValue({ id: "task-1" } as never);

    const req = makeDeleteRequest("http://localhost/api/tasks/task-1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "task-1" }) });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockedDb.task.delete).toHaveBeenCalledWith({ where: { id: "task-1" } });
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makeDeleteRequest("http://localhost/api/tasks/task-1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "task-1" }) });

    expect(res.status).toBe(401);
  });
});
