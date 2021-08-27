import {
  createPasswordHash,
  isPasswordValid,
  createJwtToken,
  createAuthPayload,
  getUserId,
  getDecodedToken,
} from '../src';
import { verify } from 'jsonwebtoken';

describe('Amon', (): void => {
  process.env.APP_SECRET = 'bar';

  it('should create a password hash', async (): Promise<void> => {
    const hashPassword = await createPasswordHash({
      nonHashedPassword: 'foo',
    });
    expect(hashPassword).toContain('$2a$10$');
  });

  it('should return true if the password is valid', async (): Promise<void> => {
    const hashPassword = await createPasswordHash({
      nonHashedPassword: 'bar',
    });
    const valid = await isPasswordValid({
      hash: hashPassword,
      password: 'bar',
    });

    expect(valid).toBeTruthy();
  });

  it('should return false if the password is valid', async (): Promise<void> => {
    const hashPassword = await createPasswordHash({
      nonHashedPassword: 'bar',
    });
    const valid = await isPasswordValid({
      hash: hashPassword,
      password: 'baz',
    });
    expect(valid).toBeFalsy();
  });

  it('should generate a token', async (): Promise<void> => {
    const token = await createJwtToken({ userId: 'bar' });
    const result = verify(token, process.env.APP_SECRET as string);

    expect(result).toMatchSnapshot({
      iat: expect.any(Number),
    });
  });

  it('should generate an AuthPayload, with user', async (): Promise<void> => {
    type User = { email: string };
    const userId = 'foo';

    const authPayload = await createAuthPayload<User>({
      userId,
      user: {
        email: 'foo@bar.com',
      },
    });

    expect(authPayload).toMatchSnapshot({
      token: expect.any(String),
    });
  });

  it('should retrieve the token payload from the headers', async (): Promise<void> => {
    const token = await createJwtToken({ userId: 'baz', payload: { role: 'USER' } });
    const headers = { authorization: token };

    const decodedToken = getDecodedToken<{ iat: number; role: string }>({ headers });

    expect(decodedToken).toMatchSnapshot({
      iat: expect.any(Number),
    });
  });

  it('should retrieve the userId from the headers', async (): Promise<void> => {
    const token = await createJwtToken({ userId: 'baz' });
    const headers = { authorization: token };

    const userId = getUserId({ headers });

    expect(userId).toMatchSnapshot();
  });

  it('should return null for getUserId if the token is expired', async (): Promise<void> => {
    const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiYXoiLCJpYXQiOjE2MzAwMjYyMTgsImV4cCI6MTYzMDAyNjI3OH0.xufbKkr3UJE1_5KCIBoM7kV8-rQ8yi7IYzfftu5H5kg`;
    const headers = { authorization: expiredToken };

    const userId = getUserId({ headers });

    expect(userId).toMatchSnapshot();
  });

  it('should return null for getUserId if the token is invalid', async (): Promise<void> => {
    const token = await createJwtToken({ userId: 'baz' });
    const headers = { authorization: token };

    const userId = getUserId({ headers, appSecret: 'foo' });

    expect(userId).toMatchSnapshot();
  });

  it('should return null if no authorization header is present', async (): Promise<void> => {
    const headers = {};
    const userId = getUserId({ headers });

    expect(userId).toBeNull();
  });
});
