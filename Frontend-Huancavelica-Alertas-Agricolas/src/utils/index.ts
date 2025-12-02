// Comentarios añadidos en español: helper `cn` para combinar clases Tailwind.
// Cómo lo logra: usa `clsx` y `twMerge` para combinar y deduplicar clases CSS.
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}