import { Profile } from "../../entities/Profile";
import { User } from "../../entities/User";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Photo } from "../../entities/Photo ";

@InputType()
class ProfileInput {
  @Field(() => String)
  gender: string;
  @Field(() => String, { nullable: true })
  photo: string;
}

@InputType()
class PhotoInput {
  @Field(() => String)
  url: string;
}

@InputType()
class UserInput {
  @Field(() => String)
  name: string;
  @Field(() => ProfileInput)
  profile: ProfileInput;

  @Field(() => [PhotoInput], { nullable: true })
  photos: PhotoInput[];
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    const users = await User.find({ relations: ["profile", "photos"] });
    return users;
  }

  //   Getting the user of as specified profile
  @Query(() => [Profile])
  async profiles(): Promise<Profile[]> {
    const profiles = await Profile.find({ relations: ["user"] });
    return profiles;
  }
  //   Getting the user of as specified profile
  @Query(() => [Photo])
  async photos(): Promise<Photo[]> {
    const photos = await Photo.find({ relations: ["user"] });
    return photos;
  }

  // Getting a user
  @Query(() => User, { nullable: true })
  async user(@Arg("id", () => Int) id: number): Promise<User | undefined> {
    const _user = await User.findOne(id, { relations: ["profile", "photos"] });
    return _user;
  }
  // Adding a user
  @Mutation(() => User)
  async addUser(
    @Arg("input") { name, profile: { gender, photo }, photos }: UserInput
  ): Promise<User> {
    //   Create all the photos
    let _photos: Photo[] = [];
    await photos.forEach(async (photo) => {
      _photos.push(
        await Photo.create({
          ...photo,
        }).save()
      );
    });

    const profile = await Profile.create({
      gender,
      photo,
    }).save();
    const user = await User.create({
      profile,
      name: name,
      photos: _photos,
    }).save();
    return user;
  }
}
