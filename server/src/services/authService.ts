import { z } from "zod";
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js";
import { createUser, findUserByEmail, findUserById, findUserByIdWithPassword } from "../lib/db.js";

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const existing = findUserByEmail(input.email);
  if (existing) throw new Error("Email already registered");

  const user = createUser({
    name: `${input.firstName} ${input.lastName}`,
    email: input.email,
    password: await hashPassword(input.password),
    avatar: input.phone,
    phone: input.phone ?? null,
    city: input.city ?? null,
    country: input.country ?? null,
    bio: input.bio ?? null
  });

  // Generate avatar based on first name
  const avatarUrl = `https://api.dicebear.com/8.x/adventurer-neutral/svg?seed=${encodeURIComponent(input.firstName)}`;
  
  // Update avatar in database
  const db = (await import("../lib/db.js")).getDb();
  const stmt = db.prepare("UPDATE users SET avatar = ? WHERE id = ?");
  stmt.run(avatarUrl, user.id);

  return { user: { ...user, avatar: avatarUrl }, token: signToken(user.id) };
}

export async function loginUser(input: z.infer<typeof loginSchema>) {
  const user = findUserByIdWithPassword(input.email);
  if (!user || !(await verifyPassword(input.password, user.password))) {
    throw new Error("Invalid email or password");
  }

  const { password, ...safeUser } = user;
  void password;
  return { user: safeUser, token: signToken(user.id) };
}

export function getCurrentUser(userId: string) {
  return findUserById(userId);
}