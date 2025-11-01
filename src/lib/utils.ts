import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export const debounce = (func: Function, delay: number) => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: any[]) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
};

export function fixJsonInput(input: string): string {
	let output = input;
	// replace single quotes with double quotes
	output = output.replace(/'/g, '"');
	// add missing quotes around keys
	output = output.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
	// correct numeric keys
	output = output.replace(/([{,])\s*([0-9]+)\s*:/g, '$1"$2":');
	// fix unquoted string values (but not true, false, null)
	output = output.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, (match, value, suffix) => {
		if (value === 'true' || value === 'false' || value === 'null') {
			return match; // don't quote boolean/null values
		}
		return `: "${value}"${suffix}`;
	});
	// escape unescaped characters
	output = output.replace(/\\(["'\\])/g, '$1');
	// lowercase true, false, null
	output = output.replace(/\b(True|False|Null)\b/g, (match) => match.toLowerCase());
	// remove comments
	output = output.replace(/\/\/.*$/gm, '');
	output = output.replace(/\/\*[\s\S]*?\*\//g, '');
	// remove trailing commas
	output = output.replace(/,\s*([}\]])/g, '$1');
	return output;
}