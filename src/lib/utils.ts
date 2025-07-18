import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function logMessages(name: string, obj: any, maxLength: number = 50) {
	if (!obj) {
		console.log(name, '');
		return;
	}

	const seen = new WeakSet();

	function truncate(value: any): any {
		if (typeof value === 'string') {
			return value.length > maxLength
				? value.slice(0, maxLength) + '...'
				: value;
		} else if (Array.isArray(value)) {
			return value.map(truncate);
		} else if (value && typeof value === 'object') {
			if (seen.has(value)) return '[Circular]';
			seen.add(value);
			const result: Record<string, any> = {};
			for (const key in value) {
				result[key] = truncate(value[key]);
			}
			return result;
		}
		return value;
	}

	console.log(name, JSON.stringify(truncate(obj), null, 2));
}
