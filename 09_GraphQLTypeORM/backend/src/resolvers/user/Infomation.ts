import { isAuthenticated } from "../../midlewares/isAuthenticated";
import { Query, Resolver, UseMiddleware } from "type-graphql";
@Resolver()
export class InformationResolver {
  @UseMiddleware(isAuthenticated)
  @Query(() => String)
  async appInformation(): Promise<any> {
    return await JSON.stringify(
      {
        name: "this is name",
        subject: "this is subject",
        id: Math.random(),
      },
      null,
      2
    );
  }
}
