import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { store } from './store.ts';

type UserRecord = { email: string; name: string; passwordHash: string; createdAt: string };
const secret = process.env.AUTH_SECRET || 'devpersona-local-development-secret';
const cookieName = 'devpersona_session';

export function publicUser(user: UserRecord & { _id?: unknown }) {
  return { id: String(user._id || ''), email: user.email, name: user.name };
}

export function setSession(res: Response, user: UserRecord & { _id?: unknown }) {
  const token = jwt.sign({ sub: String(user._id), email: user.email, name: user.name }, secret, { expiresIn: '7d' });
  res.cookie(cookieName, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 86400_000, path: '/' });
}

export async function register(email: string, password: string, name: string) {
  if (!store.db) throw new Error('MongoDB is not connected');
  const users = store.db.collection<UserRecord>('users');
  const normalized = email.trim().toLowerCase();
  if (await users.findOne({ email: normalized })) throw new Error('An account with this email already exists');
  const user: UserRecord = { email: normalized, name: name.trim() || normalized.split('@')[0], passwordHash: await bcrypt.hash(password, 12), createdAt: new Date().toISOString() };
  const result = await users.insertOne(user);
  return { ...user, _id: result.insertedId };
}

export async function login(email: string, password: string) {
  if (!store.db) throw new Error('MongoDB is not connected');
  const user = await store.db.collection<UserRecord>('users').findOne({ email: email.trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new Error('Invalid email or password');
  return user;
}

export function sessionUser(req: Request) {
  const token = req.cookies?.[cookieName];
  if (!token) return null;
  try { const payload = jwt.verify(token, secret) as { sub: string; email: string; name: string }; return { id: payload.sub, email: payload.email, name: payload.name }; }
  catch { return null; }
}

export function clearSession(res: Response) { res.clearCookie(cookieName, { path: '/' }); }
