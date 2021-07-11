import { sign, SignOptions, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import { IncomingHttpHeaders } from 'http';

export async function createPasswordHash(nonHashedPassword: string): Promise<string> {
  return hash(nonHashedPassword, 10);
}

export async function isPasswordValid(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export async function createJwtToken({
  userId,
  options = {},
  appSecret,
}: {
  userId: string;
  appSecret?: string;
  options?: SignOptions;
}): Promise<string> {
  return sign({ userId }, appSecret || (process.env.APP_SECRET as string), options);
}

export interface AuthPayload<User> {
  token: string;
  user?: User;
}

export async function createAuthPayload<T>(
  userId: string,
  user?: T,
  options?: SignOptions,
  appSecret?: string
): Promise<AuthPayload<T>> {
  return { user, token: await createJwtToken({ userId, options, appSecret }) };
}

export interface Token {
  userId: string;
}

export function getUserId<T extends IncomingHttpHeaders>(
  headers: T,
  appSecret?: string
): string | null {
  const Authorization = headers.authorization;

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const verifiedToken = verify(token, appSecret || (process.env.APP_SECRET as string)) as Token;
    return verifiedToken?.userId;
  }

  return null;
}
