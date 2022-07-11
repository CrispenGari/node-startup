import { User } from "../../../entity/User";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
class AuthError {
  @Field(() => String)
  field: string;

  @Field(() => String)
  message: string;
}

@ObjectType()
export class UserObjectType {
  @Field(() => User, { nullable: true })
  user?: User;
  @Field(() => AuthError, { nullable: true })
  error?: AuthError;
}

@ObjectType()
export class ResetObjectType {
  @Field(() => String, { nullable: true })
  message?: string;
  @Field(() => AuthError, { nullable: true })
  error?: AuthError;
}
