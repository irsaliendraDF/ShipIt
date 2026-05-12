export type Contributor = {
  /** lowercase, no spaces. used as URL slug + reference key in experiments.ts. */
  handle: string;
  /** display name as it should appear on profiles and cards. */
  name: string;
  /** one to three short sentences. shown on the contributor card and profile page. */
  bio: string;
  /** hex color used for avatar background when no avatar image is provided. */
  avatarColor: string;
  /** optional path to a square avatar image, e.g. "/crew/handle.jpg". falls back to colored initial. */
  avatar?: string;
  /** optional social links. github is encouraged; pick at most 1-2 of the others. */
  links?: {
    github?: string;
    site?: string;
    twitter?: string;
    linkedin?: string;
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
