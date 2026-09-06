import { describe, it, expect } from "vitest";
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getTokenFromRequest,
  requireAuth,
  requireAdmin,
} from "@/lib/auth";

describe("auth utilities", () => {
  describe("password hashing", () => {
    it("hashes a password and produces a non-plaintext value", async () => {
      const hashed = await hashPassword("secret123");
      expect(hashed).not.toBe("secret123");
      expect(hashed).toMatch(/^\$2[aby]\$/);
    });

    it("compares a matching password successfully", async () => {
      const hashed = await hashPassword("secret123");
      expect(await comparePassword("secret123", hashed)).toBe(true);
    });

    it("rejects a wrong password", async () => {
      const hashed = await hashPassword("secret123");
      expect(await comparePassword("wrongpass", hashed)).toBe(false);
    });
  });

  describe("JWT tokens", () => {
    it("generates a token that verifies with the user payload", () => {
      const token = generateToken("user-123", "admin");
      const decoded = verifyToken(token);
      expect(decoded).toMatchObject({ id: "user-123", role: "admin" });
    });

    it("returns null for an invalid token", () => {
      expect(verifyToken("not-a-real-token")).toBeNull();
    });

    it("returns null for a tampered token", () => {
      const token = generateToken("user-123", "user");
      const tampered = `${token.slice(0, -4)}XXXX`;
      expect(verifyToken(tampered)).toBeNull();
    });
  });

  describe("getTokenFromRequest", () => {
    function makeRequest(authHeader) {
      return {
        headers: {
          get: (name) => (name === "authorization" ? authHeader : null),
        },
      };
    }

    it("extracts a Bearer token", () => {
      const req = makeRequest("Bearer abc123");
      expect(getTokenFromRequest(req)).toBe("abc123");
    });

    it("returns null when the header is missing", () => {
      const req = makeRequest(null);
      expect(getTokenFromRequest(req)).toBeNull();
    });

    it("returns null for a non-Bearer header", () => {
      const req = makeRequest("Basic abc123");
      expect(getTokenFromRequest(req)).toBeNull();
    });
  });

  describe("requireAuth", () => {
    function makeRequest(authHeader) {
      return {
        headers: {
          get: (name) => (name === "authorization" ? authHeader : null),
        },
      };
    }

    it("returns an error when no token is provided", () => {
      const result = requireAuth(makeRequest(null));
      expect(result).toEqual({
        error: "Authentication required",
        status: 401,
      });
    });

    it("returns an error for an invalid token", () => {
      const result = requireAuth(makeRequest("Bearer garbage"));
      expect(result.status).toBe(401);
    });

    it("returns the decoded user for a valid token", () => {
      const token = generateToken("user-123", "user");
      const result = requireAuth(makeRequest(`Bearer ${token}`));
      expect(result.user).toMatchObject({ id: "user-123", role: "user" });
      expect(result.error).toBeUndefined();
    });
  });

  describe("requireAdmin", () => {
    function makeRequest(token) {
      return {
        headers: {
          get: (name) => (name === "authorization" ? `Bearer ${token}` : null),
        },
      };
    }

    it("allows an admin", () => {
      const token = generateToken("admin-1", "admin");
      const result = requireAdmin(makeRequest(token));
      expect(result.user.role).toBe("admin");
    });

    it("rejects a regular user with 403", () => {
      const token = generateToken("user-1", "user");
      const result = requireAdmin(makeRequest(token));
      expect(result).toEqual({
        error: "Admin access required",
        status: 403,
      });
    });

    it("rejects a missing token", () => {
      const result = requireAdmin({
        headers: { get: () => null },
      });
      expect(result.status).toBe(401);
    });
  });
});