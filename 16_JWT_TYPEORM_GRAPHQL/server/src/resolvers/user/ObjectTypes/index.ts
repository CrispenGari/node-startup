import { User } from "../../../entities/User";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class AuthUserObjectType {
  @Field(() => String)
  accessToken: string;

  @Field(() => User)
  user: User;
}
