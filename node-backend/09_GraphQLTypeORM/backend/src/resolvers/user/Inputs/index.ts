import { Field, InputType } from "type-graphql";
import { Length, IsEmail, MinLength } from "class-validator";
import { IsEmailTaken } from "../../../validation/isEmailTaken";

@InputType()
export class RegisterInput {
  @Field(() => String)
  @IsEmail()
  @IsEmailTaken({ message: "email already in use with another account." })
  email: string;

  @Field(() => String)
  @Length(3, 25, { message: "username must be at least 3 characters." })
  username: string;

  @Field(() => String)
  @MinLength(3, { message: "password must be at least 3 characters" })
  password: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;
}

@InputType()
export class LoginInput {
  @Field(() => String, { nullable: false })
  usernameOrEmail: string;

  @Field(() => String, { nullable: false })
  password: string;
}
