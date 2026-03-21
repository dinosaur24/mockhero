import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx for conditional class application.
 * twMerge resolves conflicts (e.g., "p-4 p-2" → "p-2").
 *
 * Usage: cn("bg-red-500", isActive && "bg-green-500", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
