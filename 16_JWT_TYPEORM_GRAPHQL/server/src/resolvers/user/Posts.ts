import {
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { isAuth } from "./middleware/isAuth";

@ObjectType()
class PostOT {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  caption: string;
}
@Resolver()
export class PostResolver {
  @Query(() => [PostOT])
  @UseMiddleware(isAuth)
  async posts(): Promise<any> {
    console.log("you are authenticated");
    return [
      {
        caption: "hello 1",
        id: 1,
      },
      {
        caption: "hello 2",
        id: 2,
      },
    ];
  }
}
