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
@Entity({ name: "posts" })
export class Post extends BaseEntity {
  constructor(caption: string) {
    super();
    this.caption = caption;
  }
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field(() => String)
  @Column({ nullable: false, unique: false })
  caption: string;

  @Field(() => String)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
