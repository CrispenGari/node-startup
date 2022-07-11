import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ type: "text", unique: true, nullable: false })
  userId: string;

  @Field(() => String)
  @Column({ type: "text", unique: true, nullable: false })
  email: string;

  @Column({ type: "text", nullable: false })
  password: string;

  @Column("int", { default: 0 })
  tokenVersion: number;
}
