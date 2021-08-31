import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Photo } from "./Photo ";
import { Profile } from "./Profile";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  //   Profile 1 to 1 relation
  @Field(() => Profile)
  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;

  //   Photo 1 to many
  @Field(() => [Photo])
  @OneToMany(() => Photo, (photo) => photo.user)
  photos: Photo[];
}
