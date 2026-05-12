import { GradientButton } from '@/components/ui/gradient-button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-4">
          404 / signal lost
        </p>
        <h1 className="font-mono font-medium text-5xl text-jet mb-4">not found.</h1>
        <p className="text-jet/65 mb-8">
          that experiment isn&apos;t here. maybe it never shipped. maybe it never will.
        </p>
        <GradientButton href="/">▶ back to shipit.fun</GradientButton>
      </div>
    </div>
  );
}
