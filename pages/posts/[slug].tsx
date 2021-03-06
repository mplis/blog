import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { Container } from "../../components/Container";
import { PostBody } from "../../components/PostBody";
import { Header } from "../../components/Header";
import { PostHeader } from "../../components/PostHeader";
import { Layout } from "../../components/Layout";
import { getPostBySlug, getAllPosts } from "../../lib/api";
import { PostTitle } from "../../components/PostTitle";
import Head from "next/head";
import { CMS_NAME } from "../../lib/constants";
import { markdownToHtml } from "../../lib/markdownToHtml";
import { Post } from "../../types/post";

type Props = {
    post: Post;
    morePosts: Post[];
    preview?: boolean;
};

const Post = ({ post, morePosts, preview }: Props) => {
    const router = useRouter();
    if (!router.isFallback && !post?.slug) {
        return <ErrorPage statusCode={404} />;
    }
    return (
        <Layout preview={preview}>
            <Container>
                <Header />
                {router.isFallback ? (
                    <PostTitle>Loading…</PostTitle>
                ) : (
                    <>
                        <article className="mb-32">
                            <Head>
                                <title>
                                    {post.title} | Next.js Blog Example with{" "}
                                    {CMS_NAME}
                                </title>
                            </Head>
                            <PostHeader title={post.title} date={post.date} />
                            <PostBody content={post.content} />
                        </article>
                    </>
                )}
            </Container>
        </Layout>
    );
};

export default Post;

type Params = {
    params: {
        slug: string;
    };
};

export async function getStaticProps({ params }: Params) {
    const post = getPostBySlug(params.slug, [
        "title",
        "date",
        "slug",
        "content",
    ]);
    const content = await markdownToHtml(post.content || "");

    return {
        props: {
            post: {
                ...post,
                content,
            },
        },
    };
}

export async function getStaticPaths() {
    const posts = getAllPosts(["slug"]);

    return {
        paths: posts.map((posts) => {
            return {
                params: {
                    slug: posts.slug,
                },
            };
        }),
        fallback: false,
    };
}
