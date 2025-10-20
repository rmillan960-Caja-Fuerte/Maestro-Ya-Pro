
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Bot,
  Check,
  Copy,
  DollarSign,
  FileText,
  Info,
  List,
  Loader2,
  Sparkles,
  UserCheck,
  UserX,
  Wrench,
} from 'lucide-react';

import { type GenerateQuoteOutput, generateQuote } from '@/ai/flows/ai-powered-quote-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  customerMessage: z.string().optional(),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ResultDisplay = ({ result }: { result: GenerateQuoteOutput }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.generatedDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Info className="h-5 w-5 text-primary" />
            <span>Detalles del Servicio</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <strong className="block text-muted-foreground">Tipo de Servicio:</strong> {result.serviceType}
          </div>
          <div>
            <strong className="block text-muted-foreground">Ubicación:</strong> {result.location}
          </div>
          <div>
            <strong className="block text-muted-foreground">Urgencia:</strong> {result.urgency}
          </div>
          <div className="flex items-center">
            <strong className="mr-2 text-muted-foreground">Cliente Existente:</strong>
            {result.existingClient ? (
              <UserCheck className="h-5 w-5 text-green-600" />
            ) : (
              <UserX className="h-5 w-5 text-red-600" />
            )}
            <span className="ml-2">{result.existingClient ? 'Sí' : 'No'}</span>
          </div>
          <div className="col-span-full">
            <strong className="block text-muted-foreground">Requerimientos:</strong> {result.requirements}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <List className="h-5 w-5 text-primary" />
            <span>Catálogo Sugerido</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {result.suggestedCatalogItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="h-5 w-5 text-primary" />
              <span>Precio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">${result.calculatedPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Calculado por IA</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wrench className="h-5 w-5 text-primary" />
              <span>Maestro</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{result.assignedMaster}</p>
            <p className="text-sm text-muted-foreground">ID del Maestro Óptimo</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              <span>Descripción Generada</span>
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copiar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="prose-sm max-w-none text-card-foreground">
          <p>{result.generatedDescription}</p>
        </CardContent>
      </Card>
      <Button className="w-full" size="lg">
        Crear Orden de Trabajo
      </Button>
    </div>
  );
};

const ResultSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="col-span-full">
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-1/2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-2/3" />
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  </div>
);

export function QuoteGenerator() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<GenerateQuoteOutput | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: 'Archivo demasiado grande',
          description: 'Por favor, sube una imagen de menos de 4MB.',
          variant: 'destructive',
        });
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setResult(null);

    try {
      const input = {
        customerMessage: values.customerMessage,
        photoDataUri: preview || undefined,
      };

      if (!input.customerMessage && !input.photoDataUri) {
        toast({
          title: 'Entrada requerida',
          description: 'Por favor, proporciona un mensaje o una imagen.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const aiResult = await generateQuote(input);
      setResult(aiResult);
    } catch (error) {
      console.error('Error generating quote:', error);
      toast({
        title: 'Error de IA',
        description: error instanceof Error ? error.message : 'No se pudo generar la cotización. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="customerMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensaje del Cliente</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: 'Hola, necesito pintar mi apartamento de 2 habitaciones. Está en la Av. Principal 123. ¿Cuanto costaría?'"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Foto del Trabajo (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        handleFileChange(e);
                      }}
                    />
                  </FormControl>
                  <FormDescription>Sube una foto del problema o del área de trabajo.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {preview && (
              <div className="relative mt-4">
                <p className="mb-2 text-sm font-medium">Vista Previa:</p>
                <Image
                  src={preview}
                  alt="Vista previa"
                  width={400}
                  height={300}
                  className="rounded-lg border bg-muted object-contain"
                />
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full py-6 text-base">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generar Cotización con IA
            </Button>
          </form>
        </Form>
      </div>

      <div className="sticky top-24">
        {isLoading && <ResultSkeleton />}
        {result && <ResultDisplay result={result} />}
        {!isLoading && !result && (
          <Card className="flex min-h-[500px] items-center justify-center border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">La cotización generada aparecerá aquí</h3>
              <p className="mt-1">Completa el formulario y deja que la IA haga su magia.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
