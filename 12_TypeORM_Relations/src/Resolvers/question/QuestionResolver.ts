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
    await categories.forEach(async (category) => {
      _categories.push(
        await Category.create({
          ...category,
        }).save()
      );
    });
    console.log(_categories);
    return await Question.create({
      title,
      categories: _categories,
    }).save();
  }
  // deleting a question
}
