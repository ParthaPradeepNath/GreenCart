import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "greencart_secret_key";
const JWT_ACCESS_EXPIRY = "7d";

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

export const requireAuth = (req) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { error: "Authentication required", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: "Invalid or expired token", status: 401 };
  }

  return { user: decoded };
};

export const requireAdmin = (req) => {
  const auth = requireAuth(req);
  if (auth.error) return auth;

  if (auth.user.role !== "admin") {
    return { error: "Admin access required", status: 403 };
  }

  return auth;
};
