import React from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  useLogoutMutation,
  usePostsQuery,
  useUserQuery,
} from "../generated/graphql";

const Register: React.FC<RouteComponentProps> = ({ history }) => {
  const { data } = useUserQuery({ fetchPolicy: "network-only" });
  const { data: post } = usePostsQuery({ fetchPolicy: "network-only" });
  const [logout, { client }] = useLogoutMutation();
  return (
    <div>
      <div
        style={{
          width: 500,
          display: "flex",
          padding: 10,
          background: "black",
          color: "white",
          justifyContent: "space-between",
        }}
      >
        <p>{data?.user?.email}</p>
        <button
          onClick={async () => {
            await logout();
            await client.resetStore().then(() => history.push("/"));
          }}
        >
          logout
        </button>
      </div>

      <div>
        {post?.posts ? (
          post?.posts.map((p: any, _: number) => (
            <p key={p.id.toString()}>{p.caption}</p>
          ))
        ) : (
          <p>Not authenticated</p>
        )}
      </div>
    </div>
  );
};

export default Register;
