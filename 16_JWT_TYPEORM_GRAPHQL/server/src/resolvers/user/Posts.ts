import { Query, Resolver, UseMiddleware } from "type-graphql";
import { isAuth } from "./middleware/isAuth";

@Resolver()
export class PostResolver {
  @Query(() => String)
  @UseMiddleware(isAuth)
  async posts(): Promise<String> {
    return JSON.stringify(
      [
        {
          caption: "hello 1",
          id: 1,
        },
        {
          caption: "hello 2",
          id: 2,
        },
      ],
      null,
      2
    );
  }
}
