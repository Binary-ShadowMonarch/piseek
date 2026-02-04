import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const STATIC_DIR = path.join(PROJECT_ROOT, 'static');
const SOURCE_FILE = path.join(STATIC_DIR, 'pi3-100-million.txt');
const OUTPUT_FILE = path.join(STATIC_DIR, 'pi-digits.bin');
const EXPECTED_DIGITS = 100_000_001;
const BUFFER_SIZE = 1_000_000; // 1 MB chunk for batched writes

async function main() {
	const sourceExists = fs.existsSync(SOURCE_FILE);
	if (!sourceExists) {
		console.error(`Source file not found: ${SOURCE_FILE}`);
		process.exit(1);
	}

	const outputStream = fs.createWriteStream(OUTPUT_FILE);

	// Reusable buffer to avoid allocating a Buffer for every single digit
	let buffer = new Uint8Array(BUFFER_SIZE);
	let bufferOffset = 0;

	const rl = readline.createInterface({
		input: fs.createReadStream(SOURCE_FILE, { encoding: 'utf8' }),
		crlfDelay: Infinity
	});

	let digitsWritten = 0;

	for await (const line of rl) {
		for (let i = 0; i < line.length; i += 1) {
			const ch = line[i];
			if (ch >= '0' && ch <= '9') {
				const digit = ch.charCodeAt(0) - 48; // '0' -> 0
				buffer[bufferOffset] = digit;
				bufferOffset += 1;
				digitsWritten += 1;

				if (bufferOffset === BUFFER_SIZE) {
					// Flush full buffer
					outputStream.write(Buffer.from(buffer));
					bufferOffset = 0;
				}
			}
		}
	}

	// Flush any remaining digits in the buffer
	if (bufferOffset > 0) {
		outputStream.write(Buffer.from(buffer.subarray(0, bufferOffset)));
	}

	outputStream.end();

	await new Promise((resolve) => {
		outputStream.on('finish', resolve);
	});

	if (digitsWritten !== EXPECTED_DIGITS) {
		console.error(
			`Expected ${EXPECTED_DIGITS.toLocaleString()} digits but wrote ${digitsWritten.toLocaleString()}`
		);
		process.exit(1);
	}

	const stats = fs.statSync(OUTPUT_FILE);
	console.log(`Wrote ${digitsWritten.toLocaleString()} digits to ${OUTPUT_FILE}`);
	console.log(`Output size: ${stats.size.toLocaleString()} bytes`);
}

main().catch((err) => {
	console.error('Error while preprocessing pi digits:', err);
	process.exit(1);
});


