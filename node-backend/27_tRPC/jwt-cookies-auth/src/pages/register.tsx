import { RegisterInput } from "@/server/schema/user.schema";
import { encode } from "@/utils/base64";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}
const Register: React.FC<Props> = ({}) => {
  const { register, handleSubmit } = useForm<RegisterInput>();
  const { mutate, error, data } = trpc.user.register.useMutation({});

  const router = useRouter();
  const onSubmit = (values: RegisterInput) => {
    mutate(values);
  };

  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && !!data?.user) {
      router.replace(`/confirm?id=${encode(data.user.id)}`);
    }
    return () => {
      mounted = false;
    };
  }, [router, data]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>Register</h1>
      <input type="email" placeholder="email" {...register("email")} />
      <br />
      <input type="text" placeholder="username" {...register("username")} />
      <br />
      <input type="password" placeholder="password" {...register("password")} />
      <br />
      <button type="submit">REGISTER</button>
      <br />
      {error ? <p>{error.message}</p> : null}
      <br />
      <Link href={"/login"}>Login</Link>
    </form>
  );
};

export default Register;
