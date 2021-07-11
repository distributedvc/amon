import {
  createPasswordHash,
  isPasswordValid,
  createJwtToken,
  createAuthPayload,
  getUserId,
} from '../src';
import { verify } from 'jsonwebtoken';

describe('Amon', (): void => {
  process.env.APP_SECRET = 'bar';

  it('should create a password hash', async (): Promise<void> => {
    const hashPassword = await createPasswordHash('foo');
    expect(hashPassword).toContain('$2a$10$');
  });

  it('should return true if the password is valid', async (): Promise<void> => {
    const hashPassword = await createPasswordHash('bar');
    const valid = await isPasswordValid('bar', hashPassword);
    expect(valid).toBeTruthy();
  });

  it('should return false if the password is valid', async (): Promise<void> => {
    const hashPassword = await createPasswordHash('bar');
    const valid = await isPasswordValid('baz', hashPassword);
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

    const authPayload = await createAuthPayload<User>(userId, {
      email: 'foo@bar.com',
    });

    expect(authPayload).toMatchSnapshot({
      token: expect.any(String),
    });
  });

  it('should retrieve the userId from the headers', async (): Promise<void> => {
    const token = await createJwtToken({ userId: 'baz' });
    const headers = { authorization: token };

    const userId = getUserId(headers);

    expect(userId).toMatchSnapshot();
  });

  it('should return null if no authorization header is present', async (): Promise<void> => {
    const headers = {};
    const userId = getUserId(headers);

    expect(userId).toBeNull();
  });
});
