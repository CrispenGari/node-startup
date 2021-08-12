import { MikroORM } from "@mikro-orm/core";
import { Todo } from "./entities/Todo";
import mikroOrmConfig from "./mikro-orm.config";
const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  await orm.getMigrator().up();
  //   const todo = orm.em.create(Todo, {
  //     title: "Cleaning",
  //   });
  //   await orm.em.persistAndFlush(todo);
  const todos = await orm.em.find(Todo, {});
  console.log(todos);
};

main().catch((err) => console.log(err));
