// Mock storage for template posts to maintain scaffold compiling without model conflicts.
interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: 'Welcome to SIMAD API',
    content: 'This is a template post to verify backend scaffold is alive.',
    createdAt: new Date().toISOString(),
  },
];

export async function getPosts() {
  try {
    return {
      success: true,
      message: 'Berhasil Get Data',
      data: mockPosts,
    };
  } catch (error) {
    console.error('Server Internal Error', error);
    return { success: false, message: 'Server Internal Error' };
  }
}

export async function CreatePost(body: { title: string; content: string }) {
  try {
    const { title, content } = body;
    const post: Post = {
      id: mockPosts.length + 1,
      title,
      content,
      createdAt: new Date().toISOString(),
    };
    mockPosts.push(post);
    return {
      success: true,
      message: 'Berhasil Post Data',
      data: post,
    };
  } catch (error) {
    console.error('Server Internal Error', error);
    return { success: false, message: 'Server Internal Error' };
  }
}
