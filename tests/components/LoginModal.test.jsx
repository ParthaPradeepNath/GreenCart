import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";

const mocks = vi.hoisted(() => ({
  useAppContext: vi.fn(),
}));

vi.mock("@/context/AppContext", () => ({
  useAppContext: mocks.useAppContext,
}));

import LoginModal from "@/components/LoginModal";

const defaultCtx = {
  showUserLogin: true,
  setShowUserLogin: vi.fn(),
  setUser: vi.fn(),
};

describe("LoginModal", () => {
  beforeEach(() => {
    mocks.useAppContext.mockReturnValue({ ...defaultCtx });
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when closed", () => {
    mocks.useAppContext.mockReturnValue({ ...defaultCtx, showUserLogin: false });
    const { container } = render(<LoginModal />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the login form in login mode", () => {
    render(<LoginModal />);
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("type here")).toHaveLength(2);
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
  });

  it("toggles to signup mode and shows the name field", async () => {
    const user = userEvent.setup();
    render(<LoginModal />);
    await user.click(screen.getByText("click here"));
    expect(screen.getByText("GreenCart", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("logs in and stores the token on success", async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({
        success: true,
        token: "jwt-token",
        user: { id: "u1", name: "Alice", email: "a@b.com", role: "user" },
      }),
    });
    render(<LoginModal />);
    const user = userEvent.setup();
    await user.type(screen.getAllByPlaceholderText("type here")[0], "a@b.com");
    await user.type(screen.getAllByPlaceholderText("type here")[1], "secret123");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("jwt-token");
      expect(defaultCtx.setUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "a@b.com" })
      );
      expect(defaultCtx.setShowUserLogin).toHaveBeenCalledWith(false);
    });
  });

  it("shows an error toast on failed login", async () => {
    const errorSpy = vi.spyOn(toast, "error");
    global.fetch.mockResolvedValue({
      json: async () => ({ success: false, message: "Invalid credentials" }),
    });
    render(<LoginModal />);
    const user = userEvent.setup();
    await user.type(screen.getAllByPlaceholderText("type here")[0], "a@b.com");
    await user.type(screen.getAllByPlaceholderText("type here")[1], "wrong");
    await user.click(screen.getByRole("button", { name: "Login" }));
    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith("Invalid credentials");
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  it("registers a new account on the signup form", async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({
        success: true,
        token: "jwt-token",
        user: { id: "u2", name: "Bob", email: "b@b.com", role: "user" },
      }),
    });
    render(<LoginModal />);
    const user = userEvent.setup();
    await user.click(screen.getByText("click here"));
    await user.type(screen.getAllByPlaceholderText("type here")[0], "Bob");
    await user.type(screen.getAllByPlaceholderText("type here")[1], "b@b.com");
    await user.type(screen.getAllByPlaceholderText("type here")[2], "secret123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));
    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("jwt-token");
      expect(defaultCtx.setUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: "b@b.com" })
      );
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.any(Object)
    );
  });
});