'use client';

import { useRef, useState } from 'react';
import { GradientButton } from '@/components/ui/gradient-button';
import type { ExperimentTag } from '@/data/experiments';

type Props = {
  slug: string;
  title: string;
  controls?: string;
  tags?: ExperimentTag[];
};

export function ExperimentFrame({ slug, title, controls, tags = [] }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showControls, setShowControls] = useState(true);

  const needsCamera = tags.includes('gesture') || tags.includes('mediapipe') || tags.includes('body');
  const needsMic = tags.includes('voice') || tags.includes('audio');

  const handleTryIt = () => {
    iframeRef.current?.focus();
    setShowControls(false);
  };

  const src = `/games-static/${slug}/index.html`;

  // Cover all features the embedded apps might need. Including 'self' lets the
  // parent delegate the feature to the same-origin iframe.
  const allowAttr = [
    "camera 'self'",
    "microphone 'self'",
    'autoplay',
    'fullscreen',
    'gyroscope',
    'accelerometer',
    "display-capture 'self'",
  ].join('; ');

  return (
    <div className="relative w-full bg-bg-elevated border border-jet/10 overflow-hidden">
      {/* Permission hint banner above the frame for camera/mic experiments */}
      {(needsCamera || needsMic) && (
        <div className="px-4 py-2.5 border-b border-warm/20 bg-warm/5 flex items-center justify-between gap-3 flex-wrap">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-warm/90">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-warm mr-2 align-middle animate-pulseDot" />
            {needsCamera && needsMic
              ? 'allow camera + microphone when prompted'
              : needsCamera
              ? 'allow camera when prompted'
              : 'allow microphone when prompted'}
          </p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-jet/60 hover:text-warm transition-colors"
          >
            having trouble? open in a new tab ↗
          </a>
        </div>
      )}

      <div className="aspect-[16/9] w-full bg-bg-deep relative">
        <iframe
          ref={iframeRef}
          src={src}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow={allowAttr}
          allowFullScreen
        />
        {showControls && controls && (
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 pointer-events-none">
            <div className="pointer-events-auto inline-flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-bg-elevated/90 backdrop-blur-md border border-accent/30 px-4 py-3 max-w-2xl">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent mb-1">
                  Controls
                </p>
                <p className="text-jet/80 text-xs sm:text-sm leading-relaxed">{controls}</p>
              </div>
              <GradientButton size="sm" onClick={handleTryIt} className="shrink-0">
                Got it ▶
              </GradientButton>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-jet/5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-jet/40 gap-3 flex-wrap">
        <span>iframe / {slug}</span>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="hover:text-accent transition-colors"
        >
          open standalone ↗
        </a>
      </div>
    </div>
  );
}
