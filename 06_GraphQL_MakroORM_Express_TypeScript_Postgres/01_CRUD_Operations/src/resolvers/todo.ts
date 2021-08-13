import { Todo } from "../entities/Todo";
import { TodoContext } from "../types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class TodoResolver {
  // Getting all todos
  @Query(() => [Todo])
  todos(@Ctx() ctx: TodoContext): Promise<Todo[]> {
    return ctx.em.find(Todo, {});
  }

  // Getting a todo
  @Query(() => Todo, { nullable: true })
  todo(
    @Arg("id", () => Int) id: number,
    @Ctx() ctx: TodoContext
  ): Promise<Todo | null> {
    return ctx.em.findOne(Todo, { id });
  }

  // Adding a todo
  @Mutation(() => Todo)
  async addTodo(
    @Arg("title") title: string,
    @Ctx() ctx: TodoContext
  ): Promise<Todo> {
    const todo = ctx.em.create(Todo, {
      title,
    });
    await ctx.em.persistAndFlush(todo);
    return todo;
  }
  // Deleting a todo

  @Mutation(() => Boolean)
  async deleteTodo(
    @Arg("id", () => Int) id: number,
    @Ctx() ctx: TodoContext
  ): Promise<boolean> {
    await ctx.em.nativeDelete(Todo, { id });
    return true;
  }
  // Updating a todo
  @Mutation(() => Todo, { nullable: true })
  async updateTodo(
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("id") id: number,
    @Ctx() ctx: TodoContext
  ): Promise<Todo | null> {
    const todo = await ctx.em.findOne(Todo, { id });
    if (!todo) {
      return null;
    }
    if (typeof title !== "undefined") {
      todo.title = title;
      await ctx.em.persistAndFlush(todo);
    }
    return todo;
  }
}
