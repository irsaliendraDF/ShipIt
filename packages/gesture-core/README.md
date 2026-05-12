# @shipit-fun/gesture-core

Shared utilities for MediaPipe Hands and Pose, used across shipit.fun experiments.

## Install (within the monorepo)

This package is workspaced. Reference it as `@shipit-fun/gesture-core` from any other workspace.

## Hands API

```ts
import { initHands, getGesture } from '@shipit-fun/gesture-core';

const video = document.querySelector('video')!;
const hands = await initHands(video, { maxNumHands: 1 });

hands.onResults((results) => {
  for (const hand of results.hands) {
    const gesture = getGesture(hand.landmarks);
    console.log(hand.handedness, gesture);
  }
});

// later
await hands.destroy();
```

`getGesture` returns one of: `fist`, `open`, `pointing`, `peace`, `thumbs_up`, `gun`, `unknown`.

## Pose API

```ts
import { initPose, getJointAngle, POSE_LANDMARK } from '@shipit-fun/gesture-core';

const video = document.querySelector('video')!;
const pose = await initPose(video);

pose.onResults((results) => {
  if (!results.landmarks) return;
  const elbowAngle = getJointAngle(
    results.landmarks,
    POSE_LANDMARK.LEFT_SHOULDER,
    POSE_LANDMARK.LEFT_ELBOW,
    POSE_LANDMARK.LEFT_WRIST
  );
  console.log('left elbow angle:', elbowAngle);
});
```

## Notes

- MediaPipe ships its WASM/asset files via CDN at runtime (`cdn.jsdelivr.net`). Ensure the page allows that origin.
- Heuristic gesture detection works well in good lighting; for precision use a trained classifier on the landmark stream.
