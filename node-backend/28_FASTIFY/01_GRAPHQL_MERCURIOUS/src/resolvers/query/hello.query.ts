export const hello = async (
  root: any,
  {
    name,
  }: Partial<{
    name: string;
  }>,
  ctx: any
) => {
  console.log({ user: ctx.user });
  return `Hello ${!!name ? name : "World"}`;
};
