import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

type ControlProps =
  | { input: InputHTMLAttributes<HTMLInputElement>; textarea?: never; select?: never }
  | { textarea: TextareaHTMLAttributes<HTMLTextAreaElement>; input?: never; select?: never }
  | {
      select: SelectHTMLAttributes<HTMLSelectElement> & {
        options: readonly string[];
        /** First, empty option, e.g. "Choose a category". */
        placeholder?: string;
      };
      input?: never;
      textarea?: never;
    };

type Props = ControlProps & {
  label: string;
  id: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

// Focus uses the global ring (2 px primary, 2 px offset) like every other control.
const CONTROL =
  'block w-full rounded-md border bg-white px-4 text-base text-brand-ink placeholder:text-brand-muted ' +
  'transition-colors duration-200 motion-reduce:transition-none';

/** Label, control, hint and error, wired together for screen readers. */
export default function Field({ label, id, hint, error, required, className = '', ...control }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const border = error ? 'border-brand-error' : 'border-brand-input-border';

  const shared = {
    id,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  } as const;

  let field;
  if (control.textarea) {
    const { className: extra = '', rows = 3, ...rest } = control.textarea;
    field = (
      <textarea {...rest} {...shared} rows={rows} className={`${CONTROL} ${border} min-h-12 py-2 ${extra}`} />
    );
  } else if (control.select) {
    const { className: extra = '', options, placeholder, ...rest } = control.select;
    field = (
      <div className="relative">
        <select
          {...rest}
          {...shared}
          className={`${CONTROL} ${border} h-12 appearance-none pr-10 ${extra}`}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.5}
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
        />
      </div>
    );
  } else {
    const { className: extra = '', ...rest } = control.input;
    field = <input {...rest} {...shared} className={`${CONTROL} ${border} h-12 ${extra}`} />;
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-brand-ink">
        {label}
      </label>
      {field}
      {hint && (
        <p id={hintId} className="mt-2 text-sm text-brand-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 flex gap-2 text-sm text-brand-error">
          <span className="flex h-5 shrink-0 items-center">
            <AlertCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
          </span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
