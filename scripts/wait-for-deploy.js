/**
 * Waits for the .deploy-ready flag file to exist before exiting.
 * Used to delay the server start until the contract is deployed.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLAG_FILE = path.join(__dirname, '..', '.deploy-ready');

const MAX_WAIT = 120_000; // 2 minutes max
const POLL_INTERVAL = 1000;

const start = Date.now();

function check() {
    if (fs.existsSync(FLAG_FILE)) {
        console.log('✅ Contract deployment detected. Starting server...');
        process.exit(0);
    }
    if (Date.now() - start > MAX_WAIT) {
        console.error('❌ Timed out waiting for contract deployment.');
        process.exit(1);
    }
    setTimeout(check, POLL_INTERVAL);
}

check();
