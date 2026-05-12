export type Contributor = {
  handle: string;
  name: string;
  bio: string;
  avatarColor: string;
  links?: {
    github?: string;
    site?: string;
    twitter?: string;
  };
};

export const contributors: Contributor[] = [
  {
    handle: 'shipitfuncrew',
    name: 'the shipit.fun crew',
    bio: 'founding crew. builds gesture-controlled, body-tracked, and AI-augmented browser experiments. backed by Digital Flow Consulting.',
    avatarColor: '#ff6fb5',
    links: {
      site: 'https://digitalflowconsulting.ca',
      github: 'https://github.com/irsaliendraDF',
    },
  },
];

export function getContributor(handle: string): Contributor | undefined {
  return contributors.find((c) => c.handle === handle);
}
