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

  // Getting a specific Query
  @Query(() => [Category], { nullable: true })
  async categories(): Promise<Category[]> {
    return await Category.find({ relations: ["questions"] });
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
