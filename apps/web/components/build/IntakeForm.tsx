'use client';

import { useState, type FormEvent } from 'react';
import { SparkSprite } from './Sprites';

// TODO: replace with real Formspree endpoint
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/REPLACE_ME';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function IntakeForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('submission failed');
      setState('success');
      form.reset();
    } catch {
      setState('error');
      setErrorMsg('something went wrong. try again or email irene@digitalflowconsulting.ca.');
    }
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-[380px] text-center bg-offwhite border border-jet/10 rounded-2xl p-10">
        <div className="flex justify-center mb-5">
          <SparkSprite size={48} />
        </div>
        <h3 className="font-display text-[28px] font-normal text-jet leading-tight">
          got it. talk soon.
        </h3>
        <p className="mt-4 font-sans text-[17px] text-jet/75 leading-relaxed">
          i read every submission. you&apos;ll hear from me within 24 hours with next steps.
          usually it&apos;s a quick reply with a discovery call link or a clarifying question.
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
      className="mx-auto max-w-[640px] bg-offwhite border border-jet/10 rounded-2xl p-8"
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
        <Field
          id="name"
          name="name"
          label="name"
          type="text"
          placeholder="your name"
          required
        />
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

        <TextareaField
          id="tool"
          name="tool"
          label="what tool are your clients asking for?"
          rows={3}
          placeholder="they keep asking us for a way to... / we need something that does... / we currently use [tool] and it doesn't quite..."
          required
        />

        <TextareaField
          id="workaround"
          name="workaround"
          label="what's the current workaround?"
          rows={2}
          placeholder="a Typeform / a spreadsheet / doing it manually / a Notion page"
        />

        <SelectField
          id="budget"
          name="budget"
          label="budget range"
          required
          options={[
            { value: 'snack', label: 'snack tier (~$1,500)' },
            { value: 'meal', label: 'meal tier (~$3,500)' },
            { value: 'feast', label: 'feast tier (~$7,500+)' },
            { value: 'unsure', label: 'not sure yet' },
          ]}
        />

        <SelectField
          id="timeline"
          name="timeline"
          label="timeline"
          required
          options={[
            { value: 'yesterday', label: 'needed yesterday' },
            { value: 'month', label: 'within a month' },
            { value: '2-3-months', label: '2-3 months' },
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
          {state === 'submitting' ? 'sending...' : 'send it →'}
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
