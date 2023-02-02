import React from "react";
import styles from "@/styles/Home.module.css";
import { useForm } from "react-hook-form";
import { PostInput } from "@/server/schema/post.schema";
import { trpc } from "@/utils/trpc";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import { Post } from "@prisma/client";
import { useScrollPosition } from "@/hooks/useScrollPosition";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

const limit: number = 4;
const Home = () => {
  const { handleSubmit, register, reset } = useForm<PostInput>();
  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.post.all.useInfiniteQuery(
      {
        limit,
      },
      {
        keepPreviousData: true,
        getNextPageParam: ({ nextCursor }) => nextCursor,
      }
    );

  const { mutateAsync, isLoading } = trpc.post.create.useMutation();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const onSubmit = async (values: PostInput) => {
    if (isLoading) return;
    mutateAsync({ ...values }).then(({ post }) => {
      setPosts((state) => [post, ...state]);
    });
    reset();
  };
  const scrollPosition = useScrollPosition();
  React.useEffect(() => {
    let mounted: boolean = true;
    if (mounted && data?.pages) {
      setPosts(data.pages.flatMap((page) => page.posts) ?? []);
    }
    return () => {
      mounted = false;
    };
  }, [data]);

  console.log({ hasNextPage });
  React.useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      console.log("fetching");
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);
  return (
    <div className={styles.home}>
      <div className={styles.home__main}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <textarea
            placeholder="What do you want to say?"
            {...register("text")}
          />
          <button type="submit">POST</button>
        </form>
        <div className={styles.home__main__main}>
          {posts.map((post) => (
            <div key={post.id} className={styles.home__post}>
              <h1>{dayjs(post.createdAt).fromNow()} ago</h1>
              <p>{post.text} </p>
            </div>
          ))}

          {isFetching ? (
            <p>fetching...</p>
          ) : (
            <button
              onClick={() => {
                fetchNextPage({});
              }}
            >
              load more
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Home;
