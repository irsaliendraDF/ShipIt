export type Landmark = {
  x: number;
  y: number;
  z: number;
  visibility?: number;
};

export type HandLandmarks = Landmark[];
export type PoseLandmarks = Landmark[];

export type Handedness = 'Left' | 'Right';

export type HandResult = {
  landmarks: HandLandmarks;
  handedness: Handedness;
  score: number;
};

export type HandsResults = {
  hands: HandResult[];
  image?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
};

export type PoseResults = {
  landmarks: PoseLandmarks | null;
  worldLandmarks: PoseLandmarks | null;
  image?: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;
};

export type GestureName =
  | 'fist'
  | 'open'
  | 'pointing'
  | 'peace'
  | 'thumbs_up'
  | 'gun'
  | 'unknown';

export type HandsOptions = {
  maxNumHands?: number;
  modelComplexity?: 0 | 1;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  selfieMode?: boolean;
};

export type PoseOptions = {
  modelComplexity?: 0 | 1 | 2;
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  selfieMode?: boolean;
};

export type HandsCallback = (results: HandsResults) => void;
export type PoseCallback = (results: PoseResults) => void;

export type HandsController = {
  onResults: (cb: HandsCallback) => void;
  destroy: () => Promise<void>;
};

export type PoseController = {
  onResults: (cb: PoseCallback) => void;
  destroy: () => Promise<void>;
};
