import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/db/client";

const app = createApp();

let creatorAToken: string;
let creatorBToken: string;
let creatorAId: string;
let creatorBId: string;
let programAId: string;
let programBId: string;
let sessionBId: string;

beforeAll(async () => {
  await prisma.importRow.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.program.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.creator.deleteMany();

  const signupA = await request(app)
    .post("/api/v1/admin/auth/signup")
    .send({
      email: "tenant-a@test.com",
      password: "password123",
      displayName: "Tenant A",
    });
  creatorAToken = signupA.body.token;
  creatorAId = signupA.body.creator.id;

  const signupB = await request(app)
    .post("/api/v1/admin/auth/signup")
    .send({
      email: "tenant-b@test.com",
      password: "password123",
      displayName: "Tenant B",
    });
  creatorBToken = signupB.body.token;
  creatorBId = signupB.body.creator.id;

  const programA = await request(app)
    .post("/api/v1/admin/programs")
    .set("Authorization", `Bearer ${creatorAToken}`)
    .send({ title: "Program A" });
  programAId = programA.body.program.id;

  const programB = await request(app)
    .post("/api/v1/admin/programs")
    .set("Authorization", `Bearer ${creatorBToken}`)
    .send({ title: "Program B" });
  programBId = programB.body.program.id;

  const sessionB = await request(app)
    .post(`/api/v1/admin/programs/${programBId}/sessions`)
    .set("Authorization", `Bearer ${creatorBToken}`)
    .send({
      title: "Session B",
      durationSeconds: 600,
      instructorName: "Instructor B",
    });
  sessionBId = sessionB.body.session.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth", () => {
  it("login returns token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/v1/admin/auth/login")
      .send({ email: "tenant-a@test.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.creator.email).toBe("tenant-a@test.com");
  });
});

describe("Tenant isolation", () => {
  it("rejects cross-tenant program access", async () => {
    const res = await request(app)
      .get(`/api/v1/admin/programs/${programBId}`)
      .set("Authorization", `Bearer ${creatorAToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects cross-tenant session update", async () => {
    const res = await request(app)
      .patch(
        `/api/v1/admin/programs/${programBId}/sessions/${sessionBId}`,
      )
      .set("Authorization", `Bearer ${creatorAToken}`)
      .send({ title: "Hijacked Session" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects cross-tenant audit log access", async () => {
    await request(app)
      .post("/api/v1/admin/programs")
      .set("Authorization", `Bearer ${creatorBToken}`)
      .send({ title: "Audit Trigger Program" });

    const res = await request(app)
      .get("/api/v1/admin/audit-logs")
      .set("Authorization", `Bearer ${creatorAToken}`);

    expect(res.status).toBe(200);
    const tenantBLogs = res.body.items.filter(
      (log: { tenantId: string }) => log.tenantId === creatorBId,
    );
    expect(tenantBLogs).toHaveLength(0);
  });
});

describe("Sessions", () => {
  it("reorder persists session order", async () => {
    const s1 = await request(app)
      .post(`/api/v1/admin/programs/${programAId}/sessions`)
      .set("Authorization", `Bearer ${creatorAToken}`)
      .send({
        title: "First",
        durationSeconds: 300,
        instructorName: "Coach",
      });

    const s2 = await request(app)
      .post(`/api/v1/admin/programs/${programAId}/sessions`)
      .set("Authorization", `Bearer ${creatorAToken}`)
      .send({
        title: "Second",
        durationSeconds: 400,
        instructorName: "Coach",
      });

    const reorder = await request(app)
      .put(`/api/v1/admin/programs/${programAId}/sessions/reorder`)
      .set("Authorization", `Bearer ${creatorAToken}`)
      .send({
        sessionIds: [s2.body.session.id, s1.body.session.id],
      });

    expect(reorder.status).toBe(200);
    expect(reorder.body.sessions[0].id).toBe(s2.body.session.id);
    expect(reorder.body.sessions[1].id).toBe(s1.body.session.id);
  });
});

describe("Bulk import", () => {
  const csvContent = `client_row_id,title,duration_seconds,instructor_name,tags,media_url
row-1,Valid Session,600,Coach A,sleep|relaxation,https://cdn.example.com/a.mp3
row-2,,0,Coach B,,not-a-url
row-3,Another Valid,900,Coach C,yoga,https://cdn.example.com/b.mp4`;

  it("returns row-level validation errors", async () => {
    const res = await request(app)
      .post(`/api/v1/admin/programs/${programAId}/sessions/import`)
      .set("Authorization", `Bearer ${creatorAToken}`)
      .set("Idempotency-Key", "import-validation-test")
      .attach("file", Buffer.from(csvContent), "sessions.csv");

    expect(res.status).toBe(201);
    expect(res.body.failed).toBeGreaterThanOrEqual(1);
    const errorRow = res.body.rows.find(
      (r: { status: string }) => r.status === "error",
    );
    expect(errorRow).toBeDefined();
    expect(errorRow.errors.length).toBeGreaterThan(0);
  });

  it("bulk import is idempotent with same Idempotency-Key", async () => {
    const key = "idempotent-import-key";

    const res1 = await request(app)
      .post(`/api/v1/admin/programs/${programAId}/sessions/import`)
      .set("Authorization", `Bearer ${creatorAToken}`)
      .set("Idempotency-Key", key)
      .attach("file", Buffer.from(csvContent), "sessions.csv");

    const res2 = await request(app)
      .post(`/api/v1/admin/programs/${programAId}/sessions/import`)
      .set("Authorization", `Bearer ${creatorAToken}`)
      .set("Idempotency-Key", key)
      .attach("file", Buffer.from(csvContent), "sessions.csv");

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    expect(res2.body.jobId).toBe(res1.body.jobId);
    expect(res2.body.succeeded).toBe(res1.body.succeeded);

    const sessionCount = await prisma.session.count({
      where: { tenantId: creatorAId, clientRowId: "row-1" },
    });
    expect(sessionCount).toBe(1);
  });
});

describe("Uploads", () => {
  it("presign rejects foreign programId", async () => {
    const res = await request(app)
      .post("/api/v1/admin/uploads/presign")
      .set("Authorization", `Bearer ${creatorAToken}`)
      .send({
        filename: "test.mp4",
        contentType: "video/mp4",
        programId: programBId,
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
