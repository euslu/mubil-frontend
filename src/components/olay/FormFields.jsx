import { AlertCircle } from 'lucide-react';

export function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-mubil-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-mubil-700">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="input-mubil"
      {...rest}
    />
  );
}

export function NumberInput({ value, onChange, step = 'any', ...rest }) {
  return (
    <input
      type="number"
      step={step}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value === '' ? null : Number(e.target.value))}
      className="input-mubil"
      {...rest}
    />
  );
}

export function DateInput({ value, onChange, ...rest }) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="input-mubil"
      {...rest}
    />
  );
}

export function TimeInput({ value, onChange, ...rest }) {
  return (
    <input
      type="time"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="input-mubil"
      {...rest}
    />
  );
}

export function Select({ value, onChange, options, placeholder = 'Seçiniz…', disabled, ...rest }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value === '' ? null : e.target.value)}
      disabled={disabled}
      className="input-mubil bg-white"
      {...rest}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Textarea({ value, onChange, rows = 3, ...rest }) {
  return (
    <textarea
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className="input-mubil"
      {...rest}
    />
  );
}
