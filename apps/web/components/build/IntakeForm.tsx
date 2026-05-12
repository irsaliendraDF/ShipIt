'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { SparkSprite } from './Sprites';
import { catalog } from '@/data/catalog';
import { supabase, type IntakeSubmissionInsert } from '@/lib/supabase';

// Optional Formspree fallback: if NEXT_PUBLIC_SUPABASE_* env vars aren't
// configured (e.g. preview deploys without env), the form falls back to
// posting at this endpoint. Leave as placeholder; Supabase is the primary
// destination once env vars are set.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_ME';

type FormState = 'idle' | 'submitting' | 'success' | 'error';
type PickKind = 'single' | 'bundle' | 'subscription' | 'custom';

const MAX_BY_KIND: Partial<Record<PickKind, number>> = {
  single: 1,
  bundle: 3,
};

/**
 * Catalog-aware intake form.
 *
 * Behavior:
 *  - The "what are you picking?" dropdown reveals the tool checkbox grid only
 *    when the buyer is in single-tool or bundle-of-3 mode.
 *  - The bundle-of-3 mode enforces a hard cap of 3 selections (additional
 *    clicks are blocked and a "you've picked 3" line appears).
 *  - On mount, the URL hash and `?tool=` query param can pre-select a single
 *    tool (set when a catalog card is clicked).
 *  - Submit POSTs to Formspree (placeholder endpoint, see TODO above).
 */
export function IntakeForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [kind, setKind] = useState<PickKind | ''>('');
  const [picks, setPicks] = useState<Set<string>>(new Set());

  // URL pre-selection: ?tool=interactive-quiz#pick-a-tool puts the form in
  // "single tool" mode with that checkbox already ticked.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('tool');
    if (slug && catalog.some((t) => t.slug === slug)) {
      setKind('single');
      setPicks(new Set([slug]));
    }
  }, []);

  const max = kind ? MAX_BY_KIND[kind] : undefined;
  const showCheckboxes = kind === 'single' || kind === 'bundle';
  const atCap = max !== undefined && picks.size >= max;

  function togglePick(slug: string) {
    setPicks((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else if (max !== undefined && next.size >= max) {
        // ignore: hit the cap (single = 1, bundle = 3)
        return prev;
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      if (supabase) {
        // Primary path: insert directly into Supabase. RLS allows anon INSERT
        // only, so submissions land but nobody can read them through this key.
        const row: IntakeSubmissionInsert = {
          name: String(data.get('name') ?? ''),
          company: String(data.get('company') ?? ''),
          email: String(data.get('email') ?? ''),
          kind: (data.get('kind') as IntakeSubmissionInsert['kind']) || 'custom',
          tools: Array.from(picks),
          business: String(data.get('business') ?? ''),
          contents: String(data.get('contents') ?? ''),
          branding:
            (data.get('branding') as IntakeSubmissionInsert['branding']) || 'help',
          timeline:
            (data.get('timeline') as IntakeSubmissionInsert['timeline']) || 'flexible',
          notes: (data.get('notes') as string) || null,
        };
        const { error } = await supabase.from('intake_submissions').insert(row);
        if (error) throw error;
      } else {
        // Fallback path: Formspree, used when env vars aren't set.
        for (const slug of picks) data.append('tools', slug);
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error('submission failed');
      }
      setState('success');
      form.reset();
      setPicks(new Set());
      setKind('');
    } catch {
      setState('error');
      setErrorMsg('something went wrong. try again or email irene@digitalflowconsulting.ca.');
    }
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-[420px] text-center bg-offwhite border border-jet/10 rounded-2xl p-10">
        <div className="flex justify-center mb-5">
          <SparkSprite size={48} />
        </div>
        <h3 className="font-display text-[28px] font-normal text-jet leading-tight">
          got it. quote coming.
        </h3>
        <p className="mt-4 font-sans text-[17px] text-jet/75 leading-relaxed">
          i&apos;ll review your selections and email you a quote and a contract within 24
          hours. once you sign and pay, your tool ships in 2 days (or your custom build
          kicks off into the 10-day timeline).
        </p>
        <a
          href="#top"
          className="mt-7 inline-flex items-center gap-1.5 font-sans font-semibold text-[15px] text-jet border border-jet/30 rounded-full px-5 py-2.5 hover:border-orange hover:text-orange transition-colors"
        >
          back to top
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      action={FORMSPREE_ENDPOINT}
      method="POST"
      className="mx-auto max-w-[720px] bg-offwhite border border-jet/10 rounded-2xl p-8"
      noValidate
    >
      {state === 'error' && errorMsg && (
        <div
          role="alert"
          className="mb-5 px-4 py-3 rounded-md bg-bubblegum/15 border border-bubblegum/40 text-jet text-sm"
        >
          {errorMsg}
        </div>
      )}

      <div className="space-y-5">
        <Field id="name" name="name" label="name" type="text" placeholder="your name" required />
        <Field
          id="company"
          name="company"
          label="company + role"
          type="text"
          placeholder="acme consulting / founder"
          required
        />
        <Field
          id="email"
          name="email"
          label="email"
          type="email"
          placeholder="you@yourcompany.com"
          required
        />

        <div>
          <label htmlFor="kind" className="block font-sans text-[14px] font-medium text-jet mb-2">
            what are you picking?<span aria-hidden="true" className="text-orange ml-1">*</span>
          </label>
          <select
            id="kind"
            name="kind"
            required
            value={kind}
            onChange={(e) => {
              const next = e.target.value as PickKind | '';
              setKind(next);
              // Reset picks when the kind changes so the cap re-applies cleanly.
              setPicks(new Set());
            }}
            className="w-full bg-white border border-jet/15 rounded-[10px] px-4 py-3.5 font-sans text-[16px] text-jet focus:outline-none focus:border-orange focus:ring-[3px] focus:ring-orange/20 transition-all"
          >
            <option value="" disabled>
              select one
            </option>
            <option value="single">single tool, pick which one below</option>
            <option value="bundle">bundle of 3, $1,500 flat</option>
            <option value="subscription">monthly subscription, let&apos;s talk</option>
            <option value="custom">custom build, let&apos;s scope it</option>
          </select>
        </div>

        {showCheckboxes && (
          <fieldset className="space-y-3">
            <legend className="font-sans text-[14px] font-medium text-jet">
              which tool{kind === 'bundle' ? 's' : ''}?
              <span aria-hidden="true" className="text-orange ml-1">*</span>
            </legend>
            <p className="font-sans text-[13px] text-jet/60">
              {kind === 'single'
                ? 'pick one tool.'
                : `pick up to three. ${
                    atCap
                      ? "you've picked 3. unselect one to swap."
                      : `${3 - picks.size} more to go.`
                  }`}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalog.map((tool) => {
                const checked = picks.has(tool.slug);
                const disabled = !checked && atCap;
                return (
                  <li key={tool.slug}>
                    <label
                      className={[
                        'flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors',
                        checked
                          ? 'border-orange bg-orange/5'
                          : disabled
                          ? 'border-jet/10 bg-white opacity-50 cursor-not-allowed'
                          : 'border-jet/10 bg-white hover:border-orange/50',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 accent-orange"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => togglePick(tool.slug)}
                      />
                      <span>
                        <span className="block font-sans text-[14px] font-medium text-jet">
                          {tool.name}
                        </span>
                        <span className="block font-sans text-[12px] text-jet/60">
                          CAD ${tool.price}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        )}

        <TextareaField
          id="business"
          name="business"
          label="tell me about your business"
          rows={3}
          placeholder="industry, what your business does, who your clients are."
          required
        />

        <TextareaField
          id="contents"
          name="contents"
          label="what goes inside the tool?"
          rows={4}
          placeholder="the content that needs to go into the tool you picked. questions, prompts, framework labels, scoring rules, prizes, whatever applies. as much detail as you have."
          required
        />

        <fieldset>
          <legend className="font-sans text-[14px] font-medium text-jet">
            branding ready to send?<span aria-hidden="true" className="text-orange ml-1">*</span>
          </legend>
          <div className="mt-2 space-y-2">
            <Radio
              name="branding"
              value="ready"
              label="yes, i have logo, brand colors, fonts ready"
              required
            />
            <Radio name="branding" value="mostly" label="mostly, i have logo and colors" />
            <Radio name="branding" value="help" label="need help, i don't have a brand kit yet" />
          </div>
        </fieldset>

        <SelectField
          id="timeline"
          name="timeline"
          label="timeline"
          required
          options={[
            { value: 'asap', label: 'asap, within a week' },
            { value: '2-3-weeks', label: '2-3 weeks is fine' },
            { value: 'flexible', label: 'flexible / exploring' },
          ]}
        />

        <TextareaField
          id="notes"
          name="notes"
          label="anything else?"
          rows={3}
          placeholder="links to inspiration, internal context, anything you want me to know."
        />
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-sans font-semibold text-[16px] bg-orange text-cream rounded-full px-7 py-3.5 hover:-translate-y-[1px] hover:shadow-[0_4px_0_rgba(255,122,61,0.3)] transition-all disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {state === 'submitting' ? 'shipping...' : 'Ship it! ⚓'}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  required?: boolean;
};

function Field({ id, name, label, type, placeholder, required }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-[14px] font-medium text-jet mb-2">
        {label}
        {required && <span aria-hidden="true" className="text-orange ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white border border-jet/15 rounded-[10px] px-4 py-3.5 font-sans text-[16px] text-jet placeholder:text-jet/40 focus:outline-none focus:border-orange focus:ring-[3px] focus:ring-orange/20 transition-all"
      />
    </div>
  );
}

type TextareaFieldProps = Omit<FieldProps, 'type'> & { rows: number };

function TextareaField({ id, name, label, rows, placeholder, required }: TextareaFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-[14px] font-medium text-jet mb-2">
        {label}
        {required && <span aria-hidden="true" className="text-orange ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white border border-jet/15 rounded-[10px] px-4 py-3.5 font-sans text-[16px] text-jet placeholder:text-jet/40 focus:outline-none focus:border-orange focus:ring-[3px] focus:ring-orange/20 transition-all resize-y"
      />
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
  required?: boolean;
};

function SelectField({ id, name, label, options, required }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block font-sans text-[14px] font-medium text-jet mb-2">
        {label}
        {required && <span aria-hidden="true" className="text-orange ml-1">*</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue=""
        className="w-full bg-white border border-jet/15 rounded-[10px] px-4 py-3.5 font-sans text-[16px] text-jet focus:outline-none focus:border-orange focus:ring-[3px] focus:ring-orange/20 transition-all"
      >
        <option value="" disabled>
          select one
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type RadioProps = {
  name: string;
  value: string;
  label: string;
  required?: boolean;
};

function Radio({ name, value, label, required }: RadioProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        required={required}
        className="mt-1 accent-orange"
      />
      <span className="font-sans text-[15px] text-jet/80">{label}</span>
    </label>
  );
}
