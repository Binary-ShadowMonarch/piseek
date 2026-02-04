import type { RequestHandler } from '@sveltejs/kit';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(process.cwd());
const STATIC_DIR = path.join(PROJECT_ROOT, 'static');
const PI_BINARY_FILE = path.join(STATIC_DIR, 'pi-digits.bin');

const TOTAL_DIGITS = 100_000_000;

export const GET: RequestHandler = async () => {
	let exists = false;
	let size = 0;

	try {
		const stats = fs.statSync(PI_BINARY_FILE);
		exists = stats.isFile();
		size = stats.size;
	} catch {
		exists = false;
	}

	const chunkSize = 1_000_000;

	return new Response(
		JSON.stringify({
			totalDigits: TOTAL_DIGITS,
			chunkSize,
			binaryAvailable: exists,
			binarySize: size
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		}
	);
};


