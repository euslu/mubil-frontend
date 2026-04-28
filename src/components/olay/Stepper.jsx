import { Check } from 'lucide-react';

export default function Stepper({ steps, currentStep, completedSteps = [] }) {
  return (
    <div className="mb-6">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, idx) => {
          const isActive    = idx === currentStep;
          const isCompleted = completedSteps.includes(idx);
          const isPast      = idx < currentStep;
          const colorActive = isActive    ? 'bg-mubil-600 text-white ring-4 ring-mubil-100' : '';
          const colorDone   = isCompleted || isPast ? 'bg-emerald-600 text-white' : '';
          const colorIdle   = !isActive && !isCompleted && !isPast ? 'bg-slate-200 text-slate-500' : '';

          return (
            <li key={step.label} className="flex flex-1 items-center gap-2">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${colorActive} ${colorDone} ${colorIdle}`}>
                {isCompleted || isPast ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <div className="hidden flex-1 sm:block">
                <div className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {step.label}
                </div>
                {step.hint && (
                  <div className="text-[11px] text-slate-400">{step.hint}</div>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`hidden h-px flex-1 sm:block ${isPast || isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
