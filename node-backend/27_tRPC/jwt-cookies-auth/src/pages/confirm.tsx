import { ConfirmInput } from "@/server/schema/user.schema";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}
const Confirm: React.FC<Props> = ({}) => {
  const { register, handleSubmit } = useForm<ConfirmInput>();
  const { mutate, error, data } = trpc.user.confirm.useMutation({});
  const router = useRouter();

  const onSubmit = (values: ConfirmInput) => {
    mutate({ ...values, id: (router.query.id as string) ?? undefined });
  };

  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !!data?.user) {
      router.replace(`/`);
    }
    return () => {
      mounted = false;
    };
  }, [router, data]);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Confirm Email</h1>
      <input type="text" placeholder="000-000" {...register("code")} />
      <br />
      <button type="submit">VERIFY</button>
      <br />
      {error ? <p>{error.message}</p> : null}
      <br />
      <Link href={"/register"}>Register</Link>
    </form>
  );
};

export default Confirm;
