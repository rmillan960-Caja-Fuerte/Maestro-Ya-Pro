
'use client';

import * as React from 'react';
import { Sparkles, Bot, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { assistantIntelligentMultimodal } from '@/ai/flows/assistant-intelligent-multimodal';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function IntelligentAssistant() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await assistantIntelligentMultimodal({ query: input });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error with multimodal assistant:', error);
      toast({
        variant: 'destructive',
        title: 'Error del Asistente',
        description: 'No se pudo obtener una respuesta. Inténtalo de nuevo.',
      });
       const assistantErrorMessage: Message = { role: 'assistant', content: 'Lo siento, tuve un problema al procesar tu solicitud.' };
       setMessages((prev) => [...prev, assistantErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Scroll to bottom when new messages are added
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableView = scrollAreaRef.current.querySelector('div');
        if (scrollableView) {
            scrollableView.scrollTop = scrollableView.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="relative h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-primary text-white shadow-lg transition-transform hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50 opacity-75"></span>
          <Sparkles className="h-8 w-8" />
          <span className="sr-only">Abrir Asistente IA</span>
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-6">
            <SheetTitle className="flex items-center gap-2">
              <Bot /> Asistente Inteligente Pro
            </SheetTitle>
            <SheetDescription>
                Haz preguntas, ejecuta tareas o pide resúmenes. Tu copiloto para la gestión de tu negocio.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 pr-4">
                 {messages.length === 0 ? (
                     <div className="text-center text-muted-foreground pt-12">
                         <p>Ej: "¿Qué maestro tiene mejor rating?"</p>
                         <p>o "Crea una orden para pintar una oficina."</p>
                     </div>
                 ) : (
                    messages.map((message, index) => (
                        <div
                        key={index}
                        className={cn(
                            'flex gap-3 text-sm',
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {message.role === 'assistant' && (
                            <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                            <AvatarFallback>
                                <Bot className="w-5 h-5"/>
                            </AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'rounded-lg px-4 py-2 max-w-[80%]',
                            message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            {message.content}
                        </div>
                        {message.role === 'user' && (
                            <Avatar className="w-8 h-8">
                            <AvatarFallback>
                                <User className="w-5 h-5"/>
                            </AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))
                 )}
                 {isLoading && (
                    <div className="flex justify-start gap-3">
                         <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                            <AvatarFallback>
                                <Bot className="w-5 h-5"/>
                            </AvatarFallback>
                            </Avatar>
                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                 )}
            </div>
          </ScrollArea>
          <SheetFooter className="p-6 pt-2 bg-background border-t">
            <form onSubmit={handleSendMessage} className="w-full flex items-start gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta o comando..."
                className="flex-1 resize-none"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                    }
                }}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Enviar</span>
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
