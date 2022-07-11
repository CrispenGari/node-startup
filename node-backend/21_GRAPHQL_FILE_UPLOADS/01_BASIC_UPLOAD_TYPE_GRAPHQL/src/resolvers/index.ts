import { NonEmptyArray } from "type-graphql";
import { UploadFileResolver } from "./UploadFile";

export const resolvers: NonEmptyArray<Function> | NonEmptyArray<string> = [
  UploadFileResolver,
];
