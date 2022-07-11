import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Todo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @CreateDateColumn()
  createdat: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedat: Date;

  @Field(() => String)
  @Column({ nullable: false })
  title: string;

  @Field(() => Boolean)
  @Column({ type: Boolean, nullable: false, default: false })
  completed!: boolean;
}
