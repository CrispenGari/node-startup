import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Profile extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column({ default: "male", nullable: false })
  gender: string;

  @Field(() => String)
  @Column({ nullable: true })
  photo: string;

  @Field(() => User)
  @OneToOne(() => User, (user) => user.profile) // specify inverse side as a second parameter
  user: User;
}
