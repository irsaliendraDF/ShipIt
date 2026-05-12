import type {
  GestureName,
  HandLandmarks,
  HandsCallback,
  HandsController,
  HandsOptions,
  HandsResults,
  Handedness,
} from './types';

const MEDIAPIPE_HANDS_CDN =
  'https://cdn.jsdelivr.net/npm/@mediapipe/hands/';

type MediaPipeHandsResults = {
  multiHandLandmarks?: HandLandmarks[];
  multiHandedness?: { label: string; score: number }[];
  image?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
};

const HAND_TIPS = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 } as const;
const HAND_PIPS = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 } as const;
const HAND_MCPS = { thumb: 2, index: 5, middle: 9, ring: 13, pinky: 17 } as const;

export async function initHands(
  videoElement: HTMLVideoElement,
  options: HandsOptions = {}
): Promise<HandsController> {
  const { Hands } = await import('@mediapipe/hands');
  const { Camera } = await import('@mediapipe/camera_utils');

  const hands = new Hands({
    locateFile: (file: string) => `${MEDIAPIPE_HANDS_CDN}${file}`,
  });

  hands.setOptions({
    maxNumHands: options.maxNumHands ?? 2,
    modelComplexity: options.modelComplexity ?? 1,
    minDetectionConfidence: options.minDetectionConfidence ?? 0.6,
    minTrackingConfidence: options.minTrackingConfidence ?? 0.5,
    selfieMode: options.selfieMode ?? true,
  });

  let userCallback: HandsCallback | null = null;

  hands.onResults((raw: MediaPipeHandsResults) => {
    if (!userCallback) return;
    const results: HandsResults = {
      hands: (raw.multiHandLandmarks ?? []).map((landmarks, i) => ({
        landmarks,
        handedness: (raw.multiHandedness?.[i]?.label ?? 'Right') as Handedness,
        score: raw.multiHandedness?.[i]?.score ?? 1,
      })),
      image: raw.image,
    };
    userCallback(results);
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({ image: videoElement });
    },
    width: videoElement.videoWidth || 1280,
    height: videoElement.videoHeight || 720,
  });

  await camera.start();

  return {
    onResults(cb) {
      userCallback = cb;
    },
    async destroy() {
      userCallback = null;
      camera.stop();
      await hands.close();
    },
  };
}

export function onHandResults(controller: HandsController, cb: HandsCallback): void {
  controller.onResults(cb);
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isFingerExtended(landmarks: HandLandmarks, tip: number, pip: number, mcp: number): boolean {
  const t = landmarks[tip];
  const p = landmarks[pip];
  const m = landmarks[mcp];
  if (!t || !p || !m) return false;
  return distance(t, m) > distance(p, m) * 1.15;
}

function isThumbExtended(landmarks: HandLandmarks): boolean {
  const tip = landmarks[HAND_TIPS.thumb];
  const ip = landmarks[HAND_PIPS.thumb];
  const mcp = landmarks[HAND_MCPS.thumb];
  const wrist = landmarks[0];
  if (!tip || !ip || !mcp || !wrist) return false;
  return distance(tip, wrist) > distance(ip, wrist) * 1.05;
}

/**
 * Heuristic gesture classifier. Good enough for V0; swap for ML if you need precision.
 */
export function getGesture(landmarks: HandLandmarks): GestureName {
  if (!landmarks || landmarks.length < 21) return 'unknown';

  const thumb = isThumbExtended(landmarks);
  const index = isFingerExtended(landmarks, HAND_TIPS.index, HAND_PIPS.index, HAND_MCPS.index);
  const middle = isFingerExtended(landmarks, HAND_TIPS.middle, HAND_PIPS.middle, HAND_MCPS.middle);
  const ring = isFingerExtended(landmarks, HAND_TIPS.ring, HAND_PIPS.ring, HAND_MCPS.ring);
  const pinky = isFingerExtended(landmarks, HAND_TIPS.pinky, HAND_PIPS.pinky, HAND_MCPS.pinky);

  const extendedCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;

  if (extendedCount === 0) return 'fist';
  if (extendedCount === 5) return 'open';
  if (thumb && index && !middle && !ring && !pinky) return 'gun';
  if (!thumb && index && !middle && !ring && !pinky) return 'pointing';
  if (!thumb && index && middle && !ring && !pinky) return 'peace';
  if (thumb && !index && !middle && !ring && !pinky) return 'thumbs_up';

  return 'unknown';
}
