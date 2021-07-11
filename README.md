<h1 align="center">
  @distributed/amon
</h1>

<p align="center">
  <a href="https://prettier.io">
    <img src="https://img.shields.io/badge/code_style-prettier-0a0a0a.svg?style=flat-square" alt="Code Style" />
  </a>

  <a href="https://npmjs.com/package/@distributed/amon">
    <img src="https://img.shields.io/npm/v/@distributed/amon/latest.svg?style=flat-square" alt="npm version" />
  </a>

  <br />

  <a href="https://npmjs.com/package/@distributed/amon">
    <img src="https://img.shields.io/npm/dt/@distributed/amon.svg?style=flat-square" alt="npm downloads" />
  </a>

  <a href="https://packagephobia.now.sh/result?p=@distributed/amon">
    <img src="https://flat.badgen.net/packagephobia/install/@distributed/amon" alt="Package Phobia" />
  </a>

  <a href="https://bundlephobia.com/result?p=@distributed/amon">
    <img src="https://flat.badgen.net/bundlephobia/minzip/@distributed/amon" alt="Bundle Phobia" />
  </a>

</p>

> Small library exposing utility methods for GraphQL

### Install

With yarn:

```bash
yarn add @distributed/amon
```

With npm:

```bash
npm install @distributed/amon
```

## Usage

### Auth

Requirements:

Use process.env.APP_SECREt or pass the appSecret into `createAuthPayload` / `createJwtToken` functions.

You can execute the following command to generate your secret:

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

```bash
# .env
APP_SECRET="45e05712755026248ef0f8f9881182b2cc3db28e64fcc42fb19d3209f5f0d19c"
```

#### Create password hash

```ts
import { createPasswordHash } from '@distributed/amon';

const hashPassword = await createPasswordHash('foo');
// => $2a$10$2M95zVobIQOm9BgNmKh/gu7IkH/LM45ZqsySlUQaFLrqAhppvm5Ei
```

#### Password validation

```ts
import { isPasswordValid } from '@distributed/amon';

const hashPassword = await createPasswordHash('bar');
const valid = await isPasswordValid('bar', hashPassword);
// => true
```

#### Get userId

```ts
import { getUserId } from '@distributed/amon';
import fastify from 'fastify';

const app = fastify();

app.get('/', async (request, reply) => {
  const userId = getUserId(request.headers);

  reply.type('application/json').code(200);
  return { userId };
});
```

#### Create Authpayload

```ts
import { getUserId } from '@distributed/amon';
import fastify from 'fastify';

const app = fastify();

app.get('/', async (request, reply) => {
  type User = { username: 'batman' };

  const userId = getUserId(request.headers);
  const authPayload = await createAuthPayload<User>(userId);

  // You can also pass the user to sign the JWT with some user props
  // const user = await db.findUnique({ where: { id: userId } });
  // const authPayload = await createAuthPayload<User>(userId, user);

  reply.type('application/json').code(200);
  return authPayload;
});
```

#### Create Jwt Token

```ts
import { createJwtToken } from '@distributed/amon';

const userId = 'foo';

// JWT Signing options
const options = {};

// App Secret, if process.env.APP_SECREt is not set
const appSecret = 'bar';

const token = await createJwtToken({ userId, options, appSecret });
```

## Development

1. Install dependencies using `yarn install` or `npm install`
2. Start development server using `yarn watch`
