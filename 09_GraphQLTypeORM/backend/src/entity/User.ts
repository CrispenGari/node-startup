import { Field, Int, ObjectType, Root } from "type-graphql";
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
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn({ type: "int" })
  id: number;

  @Field(() => String)
  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Field(() => String)
  @Column({ nullable: false })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, default: "" })
  firstName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, default: "" })
  lastName: string;

  @Field(() => Boolean, { nullable: false })
  @Column({ nullable: false, default: false })
  isLoggedIn: false | true;

  @Field(() => String, { nullable: true })
  fullName(@Root() parent: User): string {
    const name: string = `${parent.firstName} ${parent.lastName}`;
    return name;
  }

  @Field(() => Boolean)
  @Column({ nullable: false, default: false })
  confirmed: true | false;

  @Field(() => String)
  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;
}
