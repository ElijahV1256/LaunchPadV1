import { useEffect, useState, useRef } from 'react';

interface StepTransitionProps {
  stepKey: number;
  direction: 'forward' | 'backward';
  children: React.ReactNode;
}

export default function StepTransition({ stepKey, direction, children }: StepTransitionProps) {
  const [visible, setVisible] = useState(false);
  const prevKey = useRef(stepKey);

  useEffect(() => {
    if (stepKey !== prevKey.current) {
      setVisible(false);
      const timer = setTimeout(() => {
        setVisible(true);
        prevKey.current = stepKey;
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [stepKey]);

  const translateClass = direction === 'forward' ? 'translate-x-12' : '-translate-x-12';

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        visible ? 'opacity-100 translate-x-0' : `opacity-0 ${translateClass}`
      }`}
    >
      {children}
    </div>
  );
}
