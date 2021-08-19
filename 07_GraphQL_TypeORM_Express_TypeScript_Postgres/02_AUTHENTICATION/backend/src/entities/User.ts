import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  @Field(() => Int)
  @PrimaryKey()
  id: number;

  @Field(() => String)
  @Property({ type: "date" })
  createdAt = new Date();

  //   @Field(() => String)
  @Property({ type: "text", nullable: false })
  password!: string;

  @Field(() => String)
  @Property({ type: "text", unique: true, nullable: false })
  username!: string;

  @Field(() => String)
  @Property({ type: "text", nullable: false })
  email!: string;
}
