import { Todo } from "../entities/Todo";
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
class TodoInput {
  @Field(() => Int, { nullable: false })
  id: number;
}

@Resolver()
export class TodoResolver {
  // Getting all todos
  @Query(() => [Todo])
  async todos(): Promise<Todo[]> {
    return await Todo.find({});
  }

  // Getting a todo
  @Query(() => Todo, { nullable: true })
  async todo(@Arg("id", () => Int) id: number): Promise<Todo | undefined> {
    return await Todo.findOne(id);
  }

  // Adding a todo
  @Mutation(() => Todo)
  async addTodo(@Arg("title") title: string): Promise<Todo> {
    const todo = await Todo.create({
      title,
    }).save();
    return todo;
  }
  // Deleting a todo

  @Mutation(() => Boolean)
  async deleteTodo(@Arg("id", () => Int) id: number): Promise<boolean> {
    await Todo.delete({ id });
    return true;
  }
  // Updating a todo
  @Mutation(() => Todo, { nullable: true })
  async updateTodo(
    @Arg("id", () => Int, { nullable: false }) id: number
  ): Promise<Todo | undefined> {
    await Todo.update(
      { id },
      {
        completed: true,
      }
    );
    return await Todo.findOne(id);
  }
}
