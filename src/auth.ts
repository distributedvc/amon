import { sign, SignOptions, verify } from 'jsonwebtoken';
import { compare, hash } from '@node-rs/bcrypt';
import { IncomingHttpHeaders } from 'http';

export async function createPasswordHash({
  nonHashedPassword,
  salt = 10,
}: {
  nonHashedPassword: string;
  salt?: number;
}): Promise<string> {
  return hash(nonHashedPassword, salt);
}

export async function isPasswordValid({
  password,
  hash,
}: {
  password: string;
  hash: string;
}): Promise<boolean> {
  return compare(password, hash);
}

export async function createJwtToken({
  userId,
  options = {},
  appSecret,
  payload = {},
}: {
  userId: string;
  appSecret?: string;
  payload?: Record<string, unknown>;
  options?: SignOptions;
}): Promise<string> {
  return sign({ userId, ...payload }, appSecret || (process.env.APP_SECRET as string), options);
}

export interface AuthPayload<User> {
  token: string;
  user: User;
}

export async function createAuthPayload<User>({
  userId,
  user,
  options,
  appSecret,
  payload = {},
}: {
  userId: string;
  user: User;
  options?: SignOptions;
  appSecret?: string;
  payload?: Record<string, unknown>;
}): Promise<AuthPayload<User>> {
  return { user, token: await createJwtToken({ userId, payload, options, appSecret }) };
}

export interface Token {
  userId: string;
}

export function getDecodedToken<TokenPayload, T extends IncomingHttpHeaders = IncomingHttpHeaders>({
  headers,
  appSecret,
}: {
  headers: T;
  appSecret?: string;
}): (Token & TokenPayload) | null {
  const { authorization } = headers;
  const secret = appSecret || (process.env.APP_SECRET as string);

  if (authorization) {
    try {
      const token = authorization.replace('Bearer ', '');
      return verify(token, secret) as Token & TokenPayload;
    } catch (error) {
      return null;
    }
  }

  return null;
}

export function getUserId<T extends IncomingHttpHeaders>({
  headers,
  appSecret,
}: {
  headers: T;
  appSecret?: string;
}): string | null {
  return getDecodedToken({ headers, appSecret })?.userId || null;
}
