export type Comment = { author: string; text: string; date: string };

export type Post = {
  id: number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string;
  image: string;
  comments: Comment[];
};

const img = (seed: number) => `https://picsum.photos/seed/blog-${seed}/800/400`;

export const POSTS: Post[] = [
  {
    id: 1,
    title: 'Getting Started with Test Automation',
    author: 'Jane QA',
    date: '2025-01-15',
    excerpt: 'A quick intro to automating your first end-to-end test.',
    body: 'Automation testing helps you save time and increase coverage. Start small, pick a flow that breaks often, and grow from there.',
    image: img(1),
    comments: [
      { author: 'Mike', text: 'Great intro!', date: '2025-01-16' },
      { author: 'Lisa', text: 'Helped me a lot, thanks.', date: '2025-01-17' },
    ],
  },
  {
    id: 2,
    title: 'Playwright vs Cypress: A Honest Take',
    author: 'John Tester',
    date: '2025-02-02',
    excerpt: 'Both tools are great. Here is how to decide.',
    body: 'Cypress shines for fast feedback in dev environments. Playwright wins on cross-browser and parallelization. Pick based on your needs.',
    image: img(2),
    comments: [{ author: 'Anna', text: 'Agree on parallelization.', date: '2025-02-03' }],
  },
  {
    id: 3,
    title: 'Stable Selectors: data-testid Is Your Friend',
    author: 'Sara Dev',
    date: '2025-03-10',
    excerpt: 'Why selectors based on CSS classes break and how testids fix it.',
    body: 'Use data-testid attributes on interactive elements. They survive refactors and design changes.',
    image: img(3),
    comments: [],
  },
];
