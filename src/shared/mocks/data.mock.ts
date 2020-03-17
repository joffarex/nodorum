type postOptions = {
  userId?: number;
  subnodditId?: number;
};

type MockPost = {
  id: number;
  title: string;
  text: string;
  createdAt: string;
  attachment?: string;
  user: { id?: number };
  subnoddit: { id?: number };
};

const getPost = (id: number, { userId, subnodditId }: postOptions): MockPost => ({
  id,
  title: 'post',
  text: 'kappa',
  createdAt: Date.now().toString(),
  attachment: 'attachment',
  user: { id: userId },
  subnoddit: { id: subnodditId },
});
const getPostVotes = (sum: number) => ({ sum });

const getUser = (id: number, username: string) => ({ id, username });

const getSubnoddit = (id: number, name: string) => ({ id, name });

export const mockUserOne = getUser(1, 'test');
export const mockUserTwo = getUser(2, 'test2');
export const mockSubnodditOne = getSubnoddit(1, 'test');
export const mockSubnodditTwo = getSubnoddit(2, 'test2');
export const mockPostVotes = getPostVotes(0);
export const mockPosts: MockPost[] = [
  { ...getPost(1, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(2, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(3, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(4, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(5, { userId: mockUserOne.id, subnodditId: mockSubnodditOne.id }) },
  { ...getPost(6, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(7, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
  { ...getPost(8, { userId: mockUserTwo.id, subnodditId: mockSubnodditTwo.id }) },
];
export const mockPostsCount = mockPosts.length;

export const mockUpdatePost = {
  title: 'update',
  text: 'yay',
  attachment: 'attachment',
  subnodditId: 2,
};
