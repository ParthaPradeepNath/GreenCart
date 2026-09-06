import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateToken } from "@/lib/auth";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const makeRequest = (body, headers = {}) =>
  new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });

async function importRoutes() {
  const { POST: registerPOST } = await import(
    "@/app/api/auth/register/route"
  );
  const { POST: loginPOST } = await import("@/app/api/auth/login/route");
  const { GET: meGET } = await import("@/app/api/auth/me/route");
  return { registerPOST, loginPOST, meGET };
}

describe("auth API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("returns 400 when required fields are missing", async () => {
      const { registerPOST } = await importRoutes();
      const res = await registerPOST(makeRequest({ email: "a@b.com" }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain("required");
    });

    it("returns 400 for a short password", async () => {
      const { registerPOST } = await importRoutes();
      const res = await registerPOST(
        makeRequest({ name: "A", email: "a@b.com", password: "12345" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 400 when the email is already registered", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing",
        email: "a@b.com",
      });
      const { registerPOST } = await importRoutes();
      const res = await registerPOST(
        makeRequest({ name: "A", email: "A@b.com", password: "secret123" })
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.message).toContain("already exists");
    });

    it("creates a user and returns a token", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@b.com",
        role: "user",
      });
      const { registerPOST } = await importRoutes();
      const res = await registerPOST(
        makeRequest({ name: "Alice", email: "alice@b.com", password: "secret123" })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user).toMatchObject({ id: "user-1", role: "user" });
      expect(body.token).toBeTruthy();
      // password should be stored hashed, never plaintext
      const createArg = prismaMock.user.create.mock.calls[0][0];
      expect(createArg.data.password).not.toBe("secret123");
      expect(createArg.data.email).toBe("alice@b.com");
    });
  });

  describe("POST /api/auth/login", () => {
    it("returns 400 when email or password is missing", async () => {
      const { loginPOST } = await importRoutes();
      const res = await loginPOST(
        makeRequest({ password: "secret123" })
      );
      expect(res.status).toBe(400);
    });

    it("returns 401 for an unknown email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const { loginPOST } = await importRoutes();
      const res = await loginPOST(
        makeRequest({ email: "nobody@b.com", password: "secret123" })
      );
      expect(res.status).toBe(401);
    });

    it("returns 401 for a wrong password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "a@b.com",
        password: await import("@/lib/auth").then((m) =>
          m.hashPassword("rightpass")
        ),
        role: "user",
      });
      const { loginPOST } = await importRoutes();
      const res = await loginPOST(
        makeRequest({ email: "a@b.com", password: "wrongpass" })
      );
      expect(res.status).toBe(401);
    });

    it("logs in successfully and returns a token", async () => {
      const { hashPassword } = await import("@/lib/auth");
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "a@b.com",
        password: await hashPassword("secret123"),
        role: "user",
      });
      const { loginPOST } = await importRoutes();
      const res = await loginPOST(
        makeRequest({ email: "a@b.com", password: "secret123" })
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe("a@b.com");
      expect(body.token).toBeTruthy();
    });
  });

  describe("GET /api/auth/me", () => {
    function makeAuthedRequest() {
      const token = generateToken("user-1", "user");
      return new Request("http://localhost:3000/api/auth/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    it("returns 401 without a token", async () => {
      const { meGET } = await importRoutes();
      const res = await meGET(
        new Request("http://localhost:3000/api/auth/me")
      );
      expect(res.status).toBe(401);
    });

    it("returns 404 when the user no longer exists", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const { meGET } = await importRoutes();
      const res = await meGET(makeAuthedRequest());
      expect(res.status).toBe(404);
    });

    it("returns the current user", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "a@b.com",
        role: "user",
        phone: null,
      });
      const { meGET } = await importRoutes();
      const res = await meGET(makeAuthedRequest());
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.user.name).toBe("Alice");
    });
  });
});