import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true, type: "bigint" })
  id: number;

  @Field(() => String)
  @Column({ type: "varchar", nullable: false, unique: true, length: 50 })
  userId: string;

  @Field(() => String)
  @Column({ type: "varchar", nullable: false, unique: true, length: 25 })
  username: string;

  @Column({ type: "text", nullable: false })
  password: string;

  @Field(() => Int)
  @Column({ type: "int", nullable: false, default: 0 })
  tokenVersion: number;
}
