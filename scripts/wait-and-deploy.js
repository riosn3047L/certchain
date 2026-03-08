/**
 * Waits for the Hardhat node to be ready, then deploys the smart contract.
 * Writes a .deploy-ready flag file so the server knows deployment is done.
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FLAG_FILE = path.join(ROOT, '.deploy-ready');

// Clean up any stale flag from a previous run
if (fs.existsSync(FLAG_FILE)) fs.unlinkSync(FLAG_FILE);

async function waitForNode(url, maxRetries = 30, intervalMs = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 }),
            });
            if (res.ok) {
                console.log('✅ Hardhat node is ready!');
                return;
            }
        } catch {
            // Node not ready yet
        }
        console.log(`⏳ Waiting for Hardhat node... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(r => setTimeout(r, intervalMs));
    }
    throw new Error('❌ Hardhat node did not start in time.');
}

async function main() {
    await waitForNode('http://127.0.0.1:8545');

    console.log('🚀 Deploying smart contract...');
    try {
        execSync('npx hardhat run scripts/deploy.js --network localhost', {
            cwd: path.join(ROOT, 'certchain-contract'),
            stdio: 'inherit',
        });
        console.log('✅ Contract deployed successfully!');
        // Signal to the server that deployment is done
        fs.writeFileSync(FLAG_FILE, new Date().toISOString());
    } catch (err) {
        console.error('❌ Contract deployment failed:', err.message);
        process.exit(1);
    }
}

main();
