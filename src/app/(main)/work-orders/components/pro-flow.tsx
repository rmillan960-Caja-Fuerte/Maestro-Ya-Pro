'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { WorkOrder } from '../data/schema';
import {
    UserPlus, GaugeCircle, CalendarPlus, MapPin, FileText, Send, Clock, GitPullRequestIcon, 
    Users, ShoppingCart, Truck, CalendarCheck, FileStack, ClipboardList, PlayCircle, Camera,
    Package, ShieldAlert, MessageSquare, Replace, CheckCircle2, ShieldCheck, PenSquare,
    Receipt, CreditCard, Award, Star, Gift, ChevronRight, Check
} from 'lucide-react';

// DATA
const flowData = [
    { phase: "FASE 1", title: "Adquisición y Aprobación", color: "blue", steps: [
        { title: "Lead/Prospecto entrante", icon: UserPlus, tag: "Manual", status: ['lead'] },
        { title: "Generación de cotización digital", icon: FileText, tag: "Auto", status: ['draft'] },
        { title: "Decisión del cliente", icon: GitPullRequestIcon, tag: "Manual", status: ['quote_sent'] },
    ]},{
        phase: "FASE 2", title: "Planificación Estratégica", color: "purple", steps: [
            { title: "Pago de anticipo", icon: CreditCard, tag: "Auto", status: ['approved'] },
            { title: "Agendamiento de visita", icon: CalendarPlus, tag: "Auto", status: ['approved'] },
            { title: "Asignación de equipo", icon: Users, tag: "IA", status: ['approved'] },
        ]},{ 
        phase: "FASE 3", title: "Ejecución y Monitoreo", color: "amber", steps: [
            { title: "Inicio de obra (Check-in)", icon: PlayCircle, tag: "Manual", status: ['scheduled'] },
            { title: "Registro de avances (Fotos)", icon: Camera, tag: "Manual", status: ['in_progress'] },
            { title: "Finalización operativa", icon: CheckCircle2, tag: "Manual", status: ['in_progress'] },
        ]},{ 
        phase: "FASE 4", title: "Cierre y Fidelización", color: "green", steps: [
            { title: "Control de calidad", icon: ShieldCheck, tag: "Manual", status: ['completed'] },
            { title: "Pago final", icon: Receipt, tag: "Auto", status: ['completed'] },
            { title: "Cierre de orden", icon: Award, tag: "Auto", status: ['paid'] },
        ]}
];

// HELPER COMPONENTS
const Tag = ({ type }: { type: string }) => {
    const styles = {
        IA: "bg-purple-200 text-purple-800",
        Auto: "bg-blue-200 text-blue-800",
        Manual: "bg-gray-200 text-gray-800",
    };
    return <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", styles[type as keyof typeof styles] || styles.Manual)}>{type}</span>;
};

// MAIN COMPONENT
// Props are now optional to allow for a read-only mode.
interface ProFlowProps {
    workOrder?: WorkOrder;
    activeStep?: string | null;
    onStepClick?: (stepTitle: string) => void;
}

export function ProFlow({ workOrder, activeStep, onStepClick }: ProFlowProps) {

    // The logic now safely handles cases where workOrder is not provided.
    const { currentPhase, currentStep } = React.useMemo(() => {
        if (!workOrder) return { currentPhase: null, currentStep: null };

        for (const phase of flowData) {
            for (const step of phase.steps) {
                if (step.status.includes(workOrder.status)) {
                    return { currentPhase: phase.phase, currentStep: step.title };
                }
            }
        }
        return { currentPhase: null, currentStep: null };
    }, [workOrder]); // Dependency is now the whole object, which can be undefined.

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {flowData.map((phase, index) => {
                    const isCurrentPhase = phase.phase === currentPhase;

                    return (
                        <div 
                            key={phase.phase} 
                            className={cn(
                                "bg-white dark:bg-gray-800/50 border rounded-xl shadow-md transition-all duration-300",
                                isCurrentPhase ? `shadow-lg border-${phase.color}-500/50 ring-2 ring-${phase.color}-500/20` : "border-gray-200/80 dark:border-gray-700/80",
                            )}
                        >
                            <div className={cn("p-4 border-b", isCurrentPhase ? `border-${phase.color}-200/50 dark:border-${phase.color}-800/50` : "border-gray-200/80 dark:border-gray-700/80")}>
                                <p className={`text-sm font-bold text-${phase.color}-600 dark:text-${phase.color}-400`}>{phase.phase}</p>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{phase.title}</h2>
                            </div>

                            <ul className="p-2 space-y-1">
                                {phase.steps.map(step => {
                                    const isCurrentStep = step.title === currentStep;
                                    const isActiveStep = step.title === activeStep;
                                    return (
                                        <li key={step.title}>
                                            <button 
                                                onClick={() => onStepClick && onStepClick(step.title)}
                                                disabled={!onStepClick} // Disable the button if no click handler is provided
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200",
                                                    isActiveStep ? `bg-${phase.color}-100 dark:bg-${phase.color}-900/50` : "hover:bg-gray-100 dark:hover:bg-gray-700/50",
                                                    !onStepClick && "cursor-not-allowed" // Add not-allowed cursor when disabled
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <step.icon className={cn("w-5 h-5 flex-shrink-0", isCurrentStep || isActiveStep ? `text-${phase.color}-600 dark:text-${phase.color}-400` : "text-gray-400 dark:text-gray-500")} />
                                                    <span className={cn("text-sm font-medium", isCurrentStep ? "text-gray-800 dark:text-white" : "text-gray-600 dark:text-gray-300")}>
                                                        {step.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isCurrentStep && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Paso Actual"></div>}
                                                    {onStepClick && <ChevronRight className={cn("w-4 h-4 text-gray-400 transition-transform", isActiveStep && "rotate-90")} />}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
