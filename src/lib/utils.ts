import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formateo de moneda
export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency
  }).format(amount);
}

// Formateo de fecha
export function formatDate(date: Date | Timestamp, format = 'long') {
  const d = date instanceof Timestamp ? date.toDate() : date;
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  }
  
  if (format === 'short') {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  }
  
  if (format === 'relative') {
    return formatRelativeTime(d);
  }
  
  return d.toLocaleDateString('es-MX');
}

// Tiempo relativo
export function formatRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(date, 'short');
}

// Generador de color por inicial
export function getColorByInitial(name: string) {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const initial = name.charAt(0).toUpperCase();
  const index = initial.charCodeAt(0) % colors.length;
  return colors[index];
}

// Validador de email
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generador de número de orden
export function generateOrderNumber(count: number) {
  const year = new Date().getFullYear();
  const paddedCount = String(count + 1).padStart(5, '0');
  return `WO-${year}-${paddedCount}`;
}

// Calculadora de progreso de workflow
export function calculateWorkflowProgress(status: string) {
  const statusMap: Record<string, number> = {
    'draft': 0,
    'quote_sent': 20,
    'quote_approved': 40,
    'scheduled': 50,
    'in_progress': 70,
    'completed': 90,
    'paid': 100
  };
  return statusMap[status] || 0;
}

// Descargador de archivo
export async function downloadFile(url: string, filename: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Exportador a Excel
export function exportToExcel(data: any[], filename: string) {
  // Usar biblioteca como xlsx
  import('xlsx').then((XLSX) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  });
}
