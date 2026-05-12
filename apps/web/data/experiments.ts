export type ExperimentTag =
  | 'gesture'
  | 'voice'
  | 'body'
  | 'ai'
  | 'audio'
  | 'game'
  | 'fx'
  | 'mediapipe'
  | '3d'
  | 'react'
  | 'tool';

export type ExperimentStatus = 'live' | 'wip' | 'archived';

export type Experiment = {
  slug: string;
  title: string;
  description: string;
  contributor: string;
  tags: ExperimentTag[];
  status: ExperimentStatus;
  tech: string[];
  controls?: string;
  github?: string;
  thumbnail?: string;
  createdAt?: string;
  // If set, tile and carousel link out to this URL instead of /experiments/[slug].
  // Used for experiments hosted on their own domain (e.g. a standalone Vercel deploy).
  externalUrl?: string;
};

export const experiments: Experiment[] = [
  {
    slug: 'qigong',
    title: 'Qi Gong',
    description: 'Ancient cultivation, but make it for the timeline. Pose-tracked qigong with solo and duo modes.',
    contributor: 'shipitfuncrew',
    tags: ['body', 'mediapipe', 'game'],
    status: 'live',
    tech: ['MediaPipe Tasks Vision', 'Vanilla JS', 'HTML/CSS'],
    controls: 'Stand 6ft back. Pick a level (starter pack → endgame mode). Solo or duo. Move your body to cultivate qi.',
    thumbnail: '/thumbnails/qigong.svg',
    createdAt: '2026-05-10',
  },
  {
    slug: 'aura-tap',
    title: 'Aura Tap',
    description: 'Hand-tracked rhythm game. Tap notes to the beat with your aura.',
    contributor: 'shipitfuncrew',
    tags: ['gesture', 'mediapipe', 'game', 'audio'],
    status: 'live',
    tech: ['MediaPipe Tasks Vision', 'Canvas API', 'Web Audio API', 'Vite'],
    controls: 'Pick a song, then tap notes by raising your hands in time. Webcam required.',
    thumbnail: '/thumbnails/aura-tap.svg',
    createdAt: '2026-05-10',
  },
  {
    slug: 'pokemon-nova-scotia',
    title: 'Pokemon Nova Scotia',
    description: 'A Game Boy-styled exploration of Nova Scotia. Arrow keys to walk, Z to talk.',
    contributor: 'shipitfuncrew',
    tags: ['game'],
    status: 'live',
    tech: ['Vanilla JS', 'Canvas API', 'HTML/CSS'],
    controls: 'Arrow keys to walk. Z = A (talk/confirm). X = B.',
    thumbnail: '/thumbnails/pokemon-nova-scotia.svg',
    createdAt: '2026-05-10',
  },
  {
    slug: 'cinematic-gesture-fx',
    title: 'Cinematic Gesture FX',
    description: 'Iron Man repulsors, Dr. Strange portals, Spider-Man webs. Triggered by your hands.',
    contributor: 'shipitfuncrew',
    tags: ['gesture', 'mediapipe', 'fx', '3d'],
    status: 'live',
    tech: ['MediaPipe Hands', 'Three.js', 'Vanilla JS'],
    controls:
      'Open palm = Iron Man repulsor. Pinch + pull = Dr. Strange portal. Hands clap = shockwave. Point = laser. Spider-Man web shooter and more.',
    thumbnail: '/thumbnails/cinematic-gesture-fx.svg',
    createdAt: '2026-05-09',
  },
  {
    slug: 'spatial',
    title: 'Spatial',
    description: 'Hand-gesture 3D drawing in real space. Pinch to draw, fist to clear, two hands to scale.',
    contributor: 'shipitfuncrew',
    tags: ['gesture', 'mediapipe', '3d'],
    status: 'live',
    tech: ['MediaPipe Hands', 'Three.js', 'cannon-es', 'Vite'],
    controls: 'Pinch (thumb + index) to start a stroke. Move your hand to draw in 3D. Fist to clear.',
    thumbnail: '/thumbnails/spatial.svg',
    createdAt: '2026-05-09',
  },
  {
    slug: 'whispergrove',
    title: 'WhisperGrove',
    description: 'Raise Rosie the drake. A pixel-warm Tamagotchi web app of stats, spells, quests, and evolution.',
    contributor: 'shipitfuncrew',
    tags: ['game', 'react'],
    status: 'live',
    tech: ['React', 'Vite', 'Tailwind', 'Zustand'],
    controls: 'Click to feed, play, cast spells, and quest. Watch Rosie grow.',
    thumbnail: '/thumbnails/whispergrove.svg',
    createdAt: '2026-05-09',
  },
  {
    slug: 'cosmic-identity',
    title: 'Cosmic Identity',
    description:
      'Five frameworks (astrology, Chinese zodiac, numerology, Human Design, MBTI) into one cosmic profile.',
    contributor: 'shipitfuncrew',
    tags: ['ai', 'tool'],
    status: 'live',
    tech: ['Vanilla JS', 'Vite', 'Anthropic API', 'Astrologer API'],
    controls: 'Enter your birth info. Get a unified profile and compatibility report.',
    thumbnail: '/thumbnails/cosmic-identity.svg',
    createdAt: '2026-05-09',
  },
  {
    slug: 'tap-a-gram',
    title: 'Tap-A-Gram',
    description: 'Tap candies for 60 seconds, build a love note in chunky bricks, share via URL hash.',
    contributor: 'shipitfuncrew',
    tags: ['game', 'react'],
    status: 'live',
    tech: ['React', 'Vite', 'Tailwind', 'Web Audio API', 'Canvas API'],
    controls: 'Pick a tone, type the names, tap good candies (and on-vibe bonuses) while dodging gray ones for 60s.',
    createdAt: '2026-05-12',
    externalUrl: 'https://tap-a-gram.vercel.app',
  },
];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((e) => e.slug === slug);
}

export function getRelatedExperiments(slug: string, limit = 3): Experiment[] {
  const target = getExperiment(slug);
  if (!target) return [];
  const targetTags = new Set(target.tags);
  return experiments
    .filter((e) => e.slug !== slug)
    .map((e) => ({
      experiment: e,
      score: e.tags.filter((t) => targetTags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.experiment);
}

export function getExperimentsByContributor(handle: string): Experiment[] {
  return experiments.filter((e) => e.contributor === handle);
}

export function getAllTags(): ExperimentTag[] {
  const tags = new Set<ExperimentTag>();
  experiments.forEach((e) => e.tags.forEach((t) => tags.add(t)));
  return Array.from(tags);
}
