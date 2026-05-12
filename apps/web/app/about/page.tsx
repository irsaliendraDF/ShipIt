import { SectionHeader } from '@/components/SectionHeader';
import { GradientButton } from '@/components/ui/gradient-button';

export const metadata = {
  title: 'about. shipit.fun',
  description: 'what shipit.fun is, who runs it, and how to join.',
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        <SectionHeader eyebrow="About" title="the deal." />

        <div className="mt-12 space-y-10 text-jet/75 leading-relaxed">
          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
              Mission
            </p>
            <p className="text-lg text-jet/85 leading-relaxed">
              shipit.fun is a home where vibe coders ship whimsical alternative entertainment
              together, without anyone asking if it scales. gesture control, body tracking,
              voice, AI-augmented games, generative interactivity. the project exists to give
              weird interactive work a permanent home, credit the people building it, and
              prove that &ldquo;just a website&rdquo; is more powerful than most people think.
            </p>
          </section>

          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
              How it works
            </p>
            <p>
              every experiment is a self-contained piece of HTML and JavaScript living in the
              public{' '}
              <a
                href="https://github.com/irsaliendraDF/ShipIt"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                ShipIt repo
              </a>
              . contributors submit experiments via pull request. once merged, the work
              appears on this site, the contributor gets a profile page, and they keep full
              copyright on their piece. everything is MIT-licensed.
            </p>
          </section>

          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
              How to contribute
            </p>
            <p>
              the full guide is in{' '}
              <a
                href="https://github.com/irsaliendraDF/ShipIt/blob/main/CONTRIBUTING.md"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                CONTRIBUTING.md
              </a>
              . the short version: copy the <code className="font-mono text-accent">_template</code>{' '}
              folder in <code className="font-mono text-accent">games/</code>, build your
              experiment, fill in the metadata, open a PR. we aim to merge or respond within a
              week.
            </p>
          </section>

          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
              Founding contributor
            </p>
            <p>
              shipit.fun is sponsored and maintained by{' '}
              <a
                href="https://digitalflowconsulting.ca"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Digital Flow Consulting
              </a>
              , based in Atlantic Canada. Digital Flow funds the hosting, runs the GitHub org,
              and maintains the gesture-core library. every contributor outside Digital Flow is
              treated as an equal collaborator.
            </p>
          </section>

          <section>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent mb-3">
              Open source ethos
            </p>
            <p>
              we believe the browser is the most powerful creative platform ever built and
              that interactive work deserves to be shareable, remixable, and free. everything
              here is open source. fork mine, i&apos;ll fork yours. credit the original
              contributor and we&apos;ll celebrate it.
            </p>
          </section>

          <div className="pt-8">
            <GradientButton href="/experiments">▶ See what&apos;s shipping</GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
}
