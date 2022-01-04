import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { createWriteStream } from "fs";
import { GraphQLUpload, FileUpload } from "graphql-upload";
import path from "path";
import fs from "fs";

@Resolver()
export class UploadFileResolver {
  @Query(() => String)
  async helloWorld(): Promise<string> {
    return "Hello World";
  }

  @Mutation(() => Boolean)
  async uploadFile(
    @Arg("picture", () => GraphQLUpload, { nullable: false })
    { createReadStream, filename, encoding, mimetype }: FileUpload
  ): Promise<boolean> {
    console.log(mimetype, encoding, filename);
    return new Promise(async (resolve, reject) => {
      createReadStream()
        .pipe(
          createWriteStream(path.join(__dirname, `../../../images/${filename}`))
        )
        .on("finish", () => resolve(true))
        .on("error", () => reject(false));
    });
  }

  @Query(() => [String])
  async getFiles(): Promise<string[] | undefined> {
    const images = await fs.readdirSync(
      path.join(__dirname, `../../../images`)
    );
    return images.map((image) => "http://localhost:3001/images/" + image);
  }
}
