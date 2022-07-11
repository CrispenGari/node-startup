### TypeORM Relations.

I will be following the [Docs](https://typeorm.io/#/) on how to create Relations with TypeORM. I will be using GraphQL, TypeORM, Express and Postgres.

### 1. One-One Relationship

We are going to use the Profile Example, Where We are going to have a `User` related to `Profile`. We are going to make this as simple as possible.

A `uni-directional` relationship. We are going to create two entities which will be `User` and `Profile` which looks as follows:

```ts
// Profile.ts

import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

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
}
```

```ts
// User.ts

import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  BaseEntity,
} from "typeorm";
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

  @Field(() => Profile)
  @OneToOne(() => Profile) // 1-1 uni-directional relationship with Profile
  @JoinColumn()
  profile: Profile;
}
```

So now in our resolver we are going to have the following:

```ts
// UserResolver.ts

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

@InputType()
class ProfileInput {
  @Field(() => String)
  gender: string;
  @Field(() => String, { nullable: true })
  photo: string;
}

@InputType()
class UserInput {
  @Field(() => String)
  name: string;
  @Field(() => ProfileInput)
  profile: ProfileInput;
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(): Promise<User[]> {
    const users = await User.find({ relations: ["profile"] });
    return users;
  }

  // Getting a user
  @Query(() => User, { nullable: true })
  async user(@Arg("id", () => Int) id: number): Promise<User | undefined> {
    const _user = await User.findOne(id, { relations: ["profile"] });
    console.log(_user);
    return _user;
  }
  // Adding a todo
  @Mutation(() => User)
  async addUser(
    @Arg("input") { name, profile: { gender, photo } }: UserInput
  ): Promise<User> {
    const profile = await Profile.create({
      gender,
      photo,
    }).save();
    const user = await User.create({
      profile,
      name: name,
    }).save();
    return user;
  }
}
```

With this code we will be able to make the add users with their profiles, and get users with their profiles as well The challenge is we are not going to get a specific user when we query a certain profile. **So how to solve this?** By the use of `bi-directional`. Our entities will change to:

```ts
// Profile.ts
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
```

We just made our relation bi-directional. Note, inverse relation does not have a `@JoinColumn`.`@JoinColumn` must only be on one side of the relation - on the table that will own the foreign key.

```ts
// User.ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  BaseEntity,
} from "typeorm";
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

  @Field(() => Profile)
  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;
}
```

In our resolvers we can be able to get anything we want based when we query profiles, for example we can get the user for profiles by adding the following Query to our `UserResolver.ts` file

```ts
// UserResolver.ts
//   Getting the user of as specified profile
@Query(() => [Profile])
async profiles(): Promise<Profile[]> {
   const profiles = await Profile.find({ relations: ["user"] });
   return profiles;
}
```

### Many-to-one / one-to-many relations

To illustrate this relationship we are going to use the `Photo` and `User` table relations. A User can have many photos but a single photo belongs to a single user. We are going to create another entity called `Photo`.

```ts
// Photo.ts

import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Photo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  url: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.photos)
  user: User;
}
```

We are going to modify our resolver to look as follows.

```ts
// UserResolver.ts
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
```

### Many-to-Many Relations

We are going to follow the example that is in the docs of Question to Categories. So we are going to create two entities `Question` and the `Category`, which will look as follows:

> Uni-directional Relations

```ts
// Question.ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  BaseEntity,
} from "typeorm";
import { Category } from "./Category";

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => [Category])
  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];
}
```

Acording to the docs **`@JoinTable()` is required for `@ManyToMany` relations. You must put `@JoinTable` on one (owning) side of relation.**

```ts
// Category.ts
import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;
}
```

Now our resolver will look as follows:

```ts
// QuestionResolver.ts

import { Category } from "../../entities/Category";
import {
  Arg,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Question } from "../../entities/Question";

@InputType()
class CategoryInput {
  @Field(() => String)
  name: string;
}
@InputType()
class QuestionInput {
  @Field(() => String)
  title: string;
  @Field(() => [CategoryInput])
  categories: CategoryInput[];
}

@Resolver()
export class QuestionResolver {
  //  Getting all the quetions
  @Query(() => [Question])
  async questions(): Promise<Question[]> {
    return await Question.find({ relations: ["categories"] });
  }
  // Getting a specific question
  @Query(() => Question, { nullable: true })
  async question(
    @Arg("id", () => Int) id: number
  ): Promise<Question | undefined> {
    return await Question.findOne(id, { relations: ["categories"] });
  }

  // Adding a question
  @Mutation(() => Question)
  async addQuestion(
    @Arg("input", () => QuestionInput) { title, categories }: QuestionInput
  ) {
    let _categories: Category[] = [];
    for (let i = 0; i < categories.length; i++) {
      const category = await Category.create(categories[i]).save();
      _categories.push(category);
    }
    return await Question.create({
      title,
      categories: _categories,
    }).save();
  }
}
```

Next we are going to do bidirectional Relations. We are going to change our entities and they will be looking as follows:

```ts
// Category.ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
} from "typeorm";
import { Question } from "./Question";

@ObjectType()
@Entity()
export class Category extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => [Question])
  @ManyToMany(() => Question, (question) => question.categories)
  questions: Question[];
}
```

```ts
// Question.ts
import { Field, Int, ObjectType } from "type-graphql";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  BaseEntity,
} from "typeorm";
import { Category } from "./Category";

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => [Category])
  @ManyToMany(() => Category, (category) => category.questions)
  @JoinTable()
  categories: Category[];
}
```

We will modify our resolver and add the following query

```ts
...
@Query(() => [Category], { nullable: true })
  async categories(): Promise<Category[]> {
    return await Category.find({ relations: ["questions"] });
  }
```

### many-to-many relations with custom properties

In case you need to have additional properties in your many-to-many relationship, you have to create a new entity yourself. For example, if you would like entities Post and Category to have a many-to-many relationship with an additional order column, then you need to create an entity PostToCategory with two ManyToOne relations pointing in both directions and with custom columns in it. [docs](https://typeorm.io/#/many-to-many-relations)
