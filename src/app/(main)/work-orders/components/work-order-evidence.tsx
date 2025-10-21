'use client';

import * as React from 'react';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { toast } from 'sonner';
import Image from 'next/image';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UploadCloud } from 'lucide-react';

import type { WorkOrder, Evidence } from '../data/schema';

type Stage = 'before' | 'during' | 'after';

interface WorkOrderEvidenceProps {
    workOrder: WorkOrder;
}

export function WorkOrderEvidence({ workOrder }: WorkOrderEvidenceProps) {
    const firestore = useFirestore();

    // Group evidence by stage
    const evidenceByStage = React.useMemo(() => {
        const groups: Record<Stage, Evidence[]> = { before: [], during: [], after: [] };
        workOrder.evidence?.forEach(e => {
            if (groups[e.stage as Stage]) {
                groups[e.stage as Stage].push(e);
            }
        });
        return groups;
    }, [workOrder.evidence]);

    const handleFileSelectAndUpload = async (stage: Stage) => {
        // This is a simulation. In a real app, you would use a file input
        // and upload the file to a storage service like Firebase Storage.
        if (!firestore) return;
        
        const placeholderUrl = `https://via.placeholder.com/400x300.png?text=Evidencia+(${stage})`;

        const newEvidence: Evidence = {
            url: placeholderUrl,
            stage: stage,
            uploadedAt: Timestamp.now(),
        };

        const workOrderRef = doc(firestore, 'work-orders', workOrder.id);
        try {
            // The component's responsibility is now only to add the evidence record.
            await updateDoc(workOrderRef, {
                evidence: arrayUnion(newEvidence),
                updatedAt: Timestamp.now(),
            });
            toast.success("Evidencia simulada subida con éxito.");
        } catch (error) {
            console.error("Error uploading evidence: ", error);
            toast.error("Error al subir la evidencia.");
        }
    };

    const renderEvidenceSection = (title: string, stage: Stage) => (
        <div key={stage}>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{title}</h3>
                <Button variant="outline" size="sm" onClick={() => handleFileSelectAndUpload(stage)}>
                    <UploadCloud className="mr-2 h-4 w-4"/>
                    Subir Foto
                </Button>
            </div>
            {evidenceByStage[stage].length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {evidenceByStage[stage].map((e, i) => (
                        <div key={i} className="relative aspect-video rounded-md overflow-hidden border">
                            <Image src={e.url} alt={`Evidencia ${stage} ${i + 1}`} layout='fill' objectFit='cover' />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                    <p>No hay fotos en esta etapa.</p>
                </div>
            )}
            
        </div>
    );

    return (
        <Card>
             <CardHeader>
                <CardTitle>Evidencia Fotográfica</CardTitle>
                <CardDescription>Documenta el trabajo subiendo fotos del antes, durante y después.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderEvidenceSection("Antes", "before")}
                <Separator/>
                {renderEvidenceSection("Durante", "during")}
                <Separator/>
                {renderEvidenceSection("Después", "after")}
            </CardContent>
        </Card>
    );
}
