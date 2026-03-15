import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/projects/route";
import { PATCH, DELETE } from "@/app/api/projects/[id]/route";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { email: "filipe.nogueira@yesode.com" } }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    project: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    task: { count: vi.fn(), findMany: vi.fn() },
  },
}));

const mockedAuth = vi.mocked(auth);
const mockedDb = vi.mocked(db, true);

function makeGetRequest(url = "http://localhost/api/projects") {
  return new Request(url, { method: "GET" });
}

function makePostRequest(body?: object, url = "http://localhost/api/projects") {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
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

describe("POST /api/projects", () => {
  it("creates project with name and optional description, returns 201", async () => {
    const created = {
      id: "proj-1",
      name: "My Project",
      description: "A project",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.project.create.mockResolvedValue(created as never);

    const req = makePostRequest({ name: "My Project", description: "A project" });
    const res = await POST(req);

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("My Project");
    expect(mockedDb.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "My Project", description: "A project" }),
      })
    );
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makePostRequest({ name: "Test" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    const req = makePostRequest({ description: "No name" });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/name/i);
  });
});

describe("GET /api/projects", () => {
  it("returns all projects with task counts for progress bar calculation", async () => {
    const projectsFromDb = [
      {
        id: "proj-1",
        name: "Project A",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [{ status: "done" }, { status: "backlog" }, { status: "done" }],
      },
      {
        id: "proj-2",
        name: "Project B",
        description: "Desc",
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [],
      },
    ];
    mockedDb.project.findMany.mockResolvedValue(projectsFromDb as never);

    const req = makeGetRequest();
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data[0].totalTasks).toBe(3);
    expect(data[0].doneTasks).toBe(2);
    expect(data[1].totalTasks).toBe(0);
    expect(data[1].doneTasks).toBe(0);
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makeGetRequest();
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/projects/[id]", () => {
  it("updates project name and/or description", async () => {
    const updated = {
      id: "proj-1",
      name: "Updated Name",
      description: "Updated desc",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockedDb.project.update.mockResolvedValue(updated as never);

    const req = makePatchRequest(
      { name: "Updated Name", description: "Updated desc" },
      "http://localhost/api/projects/proj-1"
    );
    const res = await PATCH(req, { params: Promise.resolve({ id: "proj-1" }) });

    expect(res.status).toBe(200);
    expect(mockedDb.project.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "proj-1" } })
    );
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makePatchRequest({ name: "X" }, "http://localhost/api/projects/proj-1");
    const res = await PATCH(req, { params: Promise.resolve({ id: "proj-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/projects/[id]", () => {
  it("deletes project and cascades to tasks, returns 200", async () => {
    mockedDb.project.delete.mockResolvedValue({ id: "proj-1" } as never);

    const req = makeDeleteRequest("http://localhost/api/projects/proj-1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "proj-1" }) });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(mockedDb.project.delete).toHaveBeenCalledWith({ where: { id: "proj-1" } });
  });

  it("returns 401 when session is missing", async () => {
    mockedAuth.mockResolvedValueOnce(null);

    const req = makeDeleteRequest("http://localhost/api/projects/proj-1");
    const res = await DELETE(req, { params: Promise.resolve({ id: "proj-1" }) });

    expect(res.status).toBe(401);
  });
});
