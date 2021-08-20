import { AuthUser } from "../../entities/AuthUser";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Error {
  @Field(() => String)
  name: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => AuthUser, { nullable: true })
  user?: AuthUser;

  @Field(() => Error, { nullable: true })
  error?: Error;
}

@ObjectType()
export class Email {
  @Field(() => Error, { nullable: true })
  error?: Error;
  @Field(() => String, { nullable: true })
  message?: string;
}
