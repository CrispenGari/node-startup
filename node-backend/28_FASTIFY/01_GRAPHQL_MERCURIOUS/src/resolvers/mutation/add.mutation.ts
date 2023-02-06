import { CtxType } from "../../types";

export const add = async (
  root: any,
  {
    num1,
    num2,
  }: {
    num1: number;
    num2: number;
  },
  {}: CtxType | any
) => {
  return num1 + num2;
};
