import type {
  PoseCallback,
  PoseController,
  PoseLandmarks,
  PoseOptions,
  PoseResults,
} from './types';

const MEDIAPIPE_POSE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/';

type MediaPipePoseResults = {
  poseLandmarks?: PoseLandmarks;
  poseWorldLandmarks?: PoseLandmarks;
  image?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
};

export const POSE_LANDMARK = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

export async function initPose(
  videoElement: HTMLVideoElement,
  options: PoseOptions = {}
): Promise<PoseController> {
  const { Pose } = await import('@mediapipe/pose');
  const { Camera } = await import('@mediapipe/camera_utils');

  const pose = new Pose({
    locateFile: (file: string) => `${MEDIAPIPE_POSE_CDN}${file}`,
  });

  pose.setOptions({
    modelComplexity: options.modelComplexity ?? 1,
    smoothLandmarks: options.smoothLandmarks ?? true,
    enableSegmentation: options.enableSegmentation ?? false,
    minDetectionConfidence: options.minDetectionConfidence ?? 0.5,
    minTrackingConfidence: options.minTrackingConfidence ?? 0.5,
    selfieMode: options.selfieMode ?? true,
  });

  let userCallback: PoseCallback | null = null;

  pose.onResults((raw: MediaPipePoseResults) => {
    if (!userCallback) return;
    const results: PoseResults = {
      landmarks: raw.poseLandmarks ?? null,
      worldLandmarks: raw.poseWorldLandmarks ?? null,
      image: raw.image,
    };
    userCallback(results);
  });

  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await pose.send({ image: videoElement });
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
      await pose.close();
    },
  };
}

export function onPoseResults(controller: PoseController, cb: PoseCallback): void {
  controller.onResults(cb);
}

/**
 * Returns the angle in degrees of the vector from pointA to pointB
 * relative to the horizontal axis. Useful for "is the arm raised?" style checks.
 */
export function getBodyVector(
  landmarks: PoseLandmarks,
  pointA: number,
  pointB: number
): number {
  const a = landmarks[pointA];
  const b = landmarks[pointB];
  if (!a || !b) return 0;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const radians = Math.atan2(dy, dx);
  return (radians * 180) / Math.PI;
}

/**
 * Returns the angle in degrees at vertex `vertex` formed by the segments
 * vertex→pointA and vertex→pointB. Useful for joint angles (elbow, knee).
 */
export function getJointAngle(
  landmarks: PoseLandmarks,
  pointA: number,
  vertex: number,
  pointB: number
): number {
  const a = landmarks[pointA];
  const v = landmarks[vertex];
  const b = landmarks[pointB];
  if (!a || !v || !b) return 0;
  const ax = a.x - v.x;
  const ay = a.y - v.y;
  const bx = b.x - v.x;
  const by = b.y - v.y;
  const dot = ax * bx + ay * by;
  const magA = Math.sqrt(ax * ax + ay * ay);
  const magB = Math.sqrt(bx * bx + by * by);
  if (magA === 0 || magB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return (Math.acos(cos) * 180) / Math.PI;
}
