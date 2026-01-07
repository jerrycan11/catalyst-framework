'use client';

import * as React from 'react';
import { cn } from '@/resources/lib/utils';
import { Button } from '@/resources/components/ui/button';
import { Loader2 } from 'lucide-react';

interface WizardContextValue {
    currentStep: number;
    totalSteps: number;
    next: () => void;
    prev: () => void;
    goTo: (step: number) => void;
    isFirst: boolean;
    isLast: boolean;
    data: Record<string, any>;
    setData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const WizardContext = React.createContext<WizardContextValue | undefined>(undefined);

export function useWizard() {
    const context = React.useContext(WizardContext);
    if (!context) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}

interface WizardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    defaultStep?: number;
    onComplete?: (data: Record<string, any>) => Promise<void> | void;
    onStepChange?: (step: number, data: Record<string, any>) => Promise<boolean> | boolean | void;
}

export function Wizard({ children, defaultStep = 0, onComplete, onStepChange, className, ...props }: WizardProps) {
    const [currentStep, setCurrentStep] = React.useState(defaultStep);
    const [data, setData] = React.useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = React.useState(false);
    
    // Filter children to only render valid steps
    const steps = React.Children.toArray(children).filter((child) => 
        React.isValidElement(child) /* && child.type === WizardStep - removed check for flexibility */
    );
    const totalSteps = steps.length;

    const next = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            if (onStepChange) {
                const canProceed = await onStepChange(currentStep, data);
                if (canProceed === false) return;
            }

            if (currentStep < totalSteps - 1) {
                setCurrentStep(s => s + 1);
            } else {
                await onComplete?.(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const prev = () => {
        if (currentStep > 0 && !isLoading) {
            setCurrentStep(s => s - 1);
        }
    };

    const goTo = (step: number) => {
        if (step >= 0 && step < totalSteps && !isLoading) {
            setCurrentStep(step);
        }
    };

    const isFirst = currentStep === 0;
    const isLast = currentStep === totalSteps - 1;

    return (
        <WizardContext.Provider value={{ currentStep, totalSteps, next, prev, goTo, isFirst, isLast, data, setData, isLoading, setIsLoading }}>
            <div className={cn("w-full space-y-4", className)} {...props}>
                 <div className="mb-4 flex space-x-1">
                    {steps.map((_, index) => (
                        <div 
                            key={index} 
                            className={cn(
                                "h-1 flex-1 rounded-full transition-all duration-300", 
                                index <= currentStep ? "bg-primary" : "bg-muted"
                            )} 
                        />
                    ))}
                </div>
                {steps[currentStep]}
            </div>
        </WizardContext.Provider>
    );
}

interface WizardStepProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function WizardStep({ children, title, description, className, ...props }: WizardStepProps) {
    return (
        <div className={cn("animate-in fade-in slide-in-from-right-4 duration-300", className)} {...props}>
            {(title || description) && (
                <div className="mb-6">
                    {title && <h3 className="text-xl font-semibold tracking-tight">{title}</h3>}
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
            )}
            {children}
        </div>
    );
}

export function WizardControls({ className, submitLabel = 'Complete', nextLabel = 'Next' }: { className?: string, submitLabel?: string, nextLabel?: string }) {
    const { next, prev, isFirst, isLast, isLoading } = useWizard();

    return (
        <div className={cn("flex justify-between mt-8", className)}>
            <Button variant="outline" onClick={prev} disabled={isFirst || isLoading} type="button">
                Previous
            </Button>
            <Button onClick={next} disabled={isLoading} type="button">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLast ? submitLabel : nextLabel}
            </Button>
        </div>
    );
}
