### GraphQL, TypeORM and TypeScript

We are going to create a GraphQL Node Server that will be able to handle the authentication for us. For the Database this time we are going to use `MySQL`, we have used `Postgres` before so i feel like changing.

### In this one we are going to cover the following.

1. Registering Users
2. Deleting Accounts
3. Forgot Password
4. Verification Emails
5. Login users
6. Login users out.

### We are going to use the following techs

1. TypeScript
2. Express
3. Type ORM
4. GraphQL
5. Redis
6. MySQL

### Installation

We are going to do the basic setup for now, we are going to install more package as we go. First we want to set-up TypeORM and Apollo Server with express.

### Installation

```
yarn add typeorm reflect-metadata mysql2
```

We are going to setup the `ormconfig.json`. In our case it will look as follows

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "root",
  "database": "users",
  "synchronize": true,
  "logging": true,
  "entities": ["src/entity/**/*.ts"]
}
```

Apollo Sever and TypeGraphql Installation

```ts
yarn add express graphql apollo-server-express type-graphql
```

Argo2 for hashing passwords

```
yarn add argon2
<!-- Types -->
yarn add -D @types/argon2
```

Express session, redis, connect-redis and ioredis

```
yarn add redis connect-redis express-session ioredis
<!-- Types -->
yarn add -D @types/redis @types/connect-redis  @types/express-session @types ioredis

```

uuid for generating unique ids

```
yarn add uuid
<!-- type -->

yarn add @types/uuid
```

Node Mailer for sending emails

```
yarn add nodemailer
<!-- Types -->
yarn add @types/nodemailer -D
```

### Creating a database in mysql

```sql
CREATE DATABASE USERS;
```

### User Entity

We are going to change this entity as we move:

```ts
import { Field, Int } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field(() => String)
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Field(() => String)
  @Column({ nullable: false })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  firstName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  lastName: string;

  @Field(() => String)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
```

A basic Register mutation without validation

```ts
import { User } from "../../entity/User";
import { Arg, Mutation, Resolver } from "type-graphql";
import { UserInput } from "./Inputs";
import argon2 from "argon2";
@Resolver()
export class RegisterResolver {
  @Mutation(() => User)
  async register(
    @Arg("input", () => UserInput) input: UserInput
  ): Promise<User> {
    const hashedPassword = await argon2.hash(input.password);
    const user = await User.create({
      ...input,
      password: hashedPassword,
    }).save();
    return user;
  }
}
```

We have created a basic register mutation but that's not what we want. We want to be able to validate, If the email passed meet the requirements and so on. We can validate GraphQL. But before we do that let's say we want our resolver to return the fullName to us. We can directly do that by modifying `UserEntity` by following the example found [here](https://typegraphql.com/docs/resolvers.html). We want to add the logic that helps us to return a full name in our user resolver.

> Let's to the `entity/Users.ts` file and add that logic. By adding the following Field to our User Entity we expose the fullName to graphql without explicitly storing the fullName into the database:

```ts
 @Field(() => String, { nullable: true })
  fullName(@Root() parent: User): string {
    const name: string = `${parent.firstName} ${parent.lastName}`;
    return name;
}
```

The `entity/Users.ts` will be now looking as follows:

```ts
...
@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field(() => String)
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Field(() => String)
  @Column({ nullable: false })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, default: "" })
  firstName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, default: "" })
  lastName: string;

  @Field(() => String, { nullable: true })
  fullName(@Root() parent: User): string {
    const name: string = `${parent.firstName} ${parent.lastName}`;
    return name;
  }

  @Field(() => String)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
```

The second way we can do this is by make use of the `FieldResolver` in the Register Resolver

```ts
@Resolver(User) //  we have to explicitly tell graphQL that we are resolving the for users.
export class RegisterResolver {
  @FieldResolver(() => String)
  fullName(@Root() parent: User): string {
    return `${parent.firstName} ${parent.lastName}`;
  }
  .....

}
```

The whole code in the `Register.ts` will look as follows. **Note that we are assuming that our `User` entity does not contain the Field called fullName.**

```ts
import { User } from "../../entity/User";
import { Arg, Root, FieldResolver, Mutation, Resolver } from "type-graphql";
import { UserInput } from "./Inputs";
import argon2 from "argon2";
@Resolver(User) //
export class RegisterResolver {
  @FieldResolver(() => String)
  fullName(@Root() parent: User): string {
    return `${parent.firstName} ${parent.lastName}`;
  }
  @Mutation(() => User)
  async register(
    @Arg("input", () => UserInput) input: UserInput
  ): Promise<User> {
    const hashedPassword = await argon2.hash(input.password);
    const user = await User.create({
      ...input,
      password: hashedPassword,
    }).save();
    return user;
  }
}
```

> Next we are going to add validation to graphql resolvers using a package called [class-validator](https://github.com/typestack/class-validator) the validation docs of typegraphql can be found [https://typegraphql.com/docs/validation.html](here)

Installation

```shell
yarn add class-validator
```

So we are going to head to our `Inputs/index.ts` file to create validations for each field using the `class-validator`. Before adding validation the file looks a follows:

```ts
...
@InputType()
export class UserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;
}
```

There are a lot of class decorators that we can to validate our Fields. Later on we are going to have a look at how we can create our own validators. Now after validation our `UserInput` will look as follows:

```ts
import { Field, InputType } from "type-graphql";
import { Length, IsEmail } from "class-validator";

@InputType()
export class UserInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  @Length(3, 25, { message: "username must be at least 3 characters." })
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;
}
```

Custom validation error: We want to add a logic that checks if the email already exists or not. I'm just going to copy some cody from [here](https://github.com/typestack/class-validator#custom-validation-classes) and modify it a little bit. First we will create our custom validator called `isEmailTaken` in the `validation` folder

```ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { User } from "src/entity/User";

@ValidatorConstraint({ async: true })
export class IsEmailTakenConstraint implements ValidatorConstraintInterface {
  validate(email: any, args: ValidationArguments) {
    return User.findOne({ where: { email } }).then((user: any) => {
      if (user) return false;
      return true;
    });
  }
}
export function IsEmailTaken(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailTakenConstraint,
    });
  };
}
```

We are validating the email by checking if it is in the database or not. So we are going to decorate the `email` Field as follows:

```ts
...
@InputType()
export class UserInput {
  @Field(() => String)
  @IsEmail()
  @IsEmailTaken({  message: "email already in use with another account." })
  email: string;
...
}
```

### Login

Next we are going to create a resolver that will allow users to login on our application. We are going to use `express-session` to do this. First of all in or graphql playground we want to to to the settings and change the following property:

```json
{
  "request.credentials": "include"
}
```

We have changed the `request.credentials` from `omit` to `include`. This will allow or graphql playground to work with cookies. We have already installed all the requirements for this to work so we are ready to code. **All the code logic can now be found on the files except for new things.**

### TypeGraphQL Authorization

> Authorization is a core feature used in almost all APIs. Sometimes we want to restrict data access or actions for a specific group of users. ~~ [docs](https://typegraphql.com/docs/authorization.html)

We are going to create a simple resolver called `Information` and it looks as follows for now:

```ts
import { Authorized, Query, Resolver } from "type-graphql";
@Resolver()
export class InformationResolver {
  @Authorized()
  @Query(() => String)
  async appInformation(): Promise<any> {
    return await JSON.stringify(
      {
        name: "this is name",
        subject: "this is subject",
        id: Math.random(),
      },
      null,
      2
    );
  }
}
```

We want this Resolver to be accessed with only people who are logged in. We can add an `@Authorized()` decorator on our Resolver.

Now we have to go to the `sever.ts` and add the following `authChecker` logic in the `buildSchema` object:

```ts
const apolloSever = new ApolloServer({
  schema: await buildSchema({
    resolvers: [
      HelloWorldResolver,
      RegisterResolver,
      LoginResolver,
      UserResolver,
      LogoutResolver,
      DeleteAccountResolver,
      InformationResolver,
    ],
    validate: false,
    authChecker: ({ context }, _roles) => {
      return context.req.session.userId;
    },
  }),
  context: ({ req, res }) => ({
    req,
    res,
    redis,
  }),
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
});
```

So Now our `Information` Resolver will be accessed only with `authenticated` people. We can add whatever logic we want but for simplicity i just checked if the user has a session or not by returning `return context.req.session.userId`. We can perform the same task by using `Middleware and guards` you can find that [here](https://typegraphql.com/docs/middlewares.html).

> Let's go ahead and create a `Middleware` that will do the same as we did before, allowing users to access our resolver only if they are authenticated.

Our Information.ts file will look as follows:

```ts
import { isAuthenticated } from "../../midlewares/isAuthenticated";
import { Query, Resolver, UseMiddleware } from "type-graphql";
@Resolver()
export class InformationResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => String)
  async appInformation(): Promise<any> {
    return await JSON.stringify(
      {
        name: "this is name",
        subject: "this is subject",
        id: Math.random(),
      },
      null,
      2
    );
  }
}
```

We have created a folder called `midlewares` that will contain all the middlewares we are going to use. So `@UseMiddleware()` accept a custom middleware in our case `isAuthenticated` which looks as follows:

```ts
import { UserContext } from "src/types";
import { MiddlewareFn } from "type-graphql";
export const isAuthenticated: MiddlewareFn<UserContext> = async (
  { context },
  next
) => {
  if (typeof context.req.session.userId === "undefined") {
    throw new Error("You are not authenticated");
  }
  return next();
};
```

That's the basics on how we can Authorize users to access certain resources in TypeGraphQL

### Refs

- [TypeORM](https://typeorm.io/#/)
- The [express-session](https://github.com/expressjs/session) repository
