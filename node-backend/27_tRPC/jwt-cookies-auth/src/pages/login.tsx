import { LoginInput } from "@/server/schema/user.schema";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}
const Login: React.FC<Props> = ({}) => {
  const { register, handleSubmit } = useForm<LoginInput>();
  const { mutate, error, data } = trpc.user.login.useMutation({});

  const router = useRouter();
  const onSubmit = (values: LoginInput) => {
    mutate(values);
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
      <h1>Login</h1>
      <input type="email" placeholder="email" {...register("email")} />
      <br />
      <input type="password" placeholder="password" {...register("password")} />
      <br />
      <button type="submit">LOGIN</button>
      <br />
      {error ? <p>{error.message}</p> : null}
      <br />
      <Link href={"/register"}>Register</Link>
    </form>
  );
};

export default Login;
