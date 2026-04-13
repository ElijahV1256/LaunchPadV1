import { CheckCircle2 } from 'lucide-react';

interface BrandProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function BrandProgress({ currentStep, totalSteps, stepLabels }: BrandProgressProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/10" />
        <div
          className="absolute top-3 left-0 h-0.5 bg-[#2979FF] transition-all duration-500 ease-out"
          style={{ width: `${((currentStep) / (totalSteps - 1)) * 100}%` }}
        />
        {stepLabels.map((label, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#06D6A0]'
                    : isCurrent
                    ? 'bg-[#2979FF] ring-4 ring-[#2979FF]/30'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={14} className="text-white" />
                ) : (
                  <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                    {idx + 1}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-medium whitespace-nowrap transition-colors duration-300 ${
                  isCompleted
                    ? 'text-[#06D6A0]'
                    : isCurrent
                    ? 'text-white'
                    : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
