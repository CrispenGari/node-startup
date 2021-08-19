import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @CreateDateColumn()
  createdat: Date;

  @Column({ type: "text", nullable: false })
  password!: string;

  @Field(() => String)
  @Column({ type: "text", unique: true, nullable: false })
  username!: string;

  @Field(() => String)
  @Column({ type: "text", nullable: false })
  email!: string;
}
