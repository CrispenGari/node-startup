import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloWorldResolver {
  @Query(() => String)
  async helloWorld(): Promise<string> {
    return await "hello world!";
  }
}
