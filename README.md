# CertChain

CertChain is a decentralized, Web3-powered platform designed to issue, manage, and verify academic certificates with absolute cryptographic certainty. Built on the Polygon blockchain (Amoy testnet supported), it prevents credential fraud by providing a transparent, immutable record of issued certificates.

## Architecture Highlights

CertChain follows a modern three-tier architecture:

1. **`certchain-contract` (Smart Contract Layer):** 
   - Written in Solidity.
   - Deployed using Hardhat.
   - Core logic for registry, issuance (single & bulk), revocation, and on-chain verification.
   - Built on standard OpenZeppelin AccessControl mechanisms.

2. **`certchain-server` (Backend Node API):**
   - Node.js & Express RESTful API.
   - `ethers.js` (v6) used as the proxy relayer to interact with the blockchain.
   - Uses MongoDB (`mongodb-memory-server` by default for zero-config local development) to index data, providing high-performance search and analytics without exposing sensitive off-chain student information.
   - SHA-256 deterministic hashing ensures data integrity between on-chain hashes and off-chain data.

3. **`certchain-frontend` (Client-Side Application):**
   - Built with React (Vite) and React Router v7.
   - Custom utility-based CSS and components (Cards, Badges, Modals) for a premium, responsive UI.
   - Features dynamic animated statistics, a public verification portal, and a comprehensive institution admin dashboard.
   - Clean, dark-mode ready design.

## Features

- **🎓 Issuance:** Issue single certificates or drastically reduce admin workload via the **Bulk CSV Upload** tool.
- **✅ Instant Verification:** A public-facing portal allows instant cryptographic verification of a student's certificate ID or data.
- **🛡️ High Security:** Sensitive PII (Personally Identifiable Information) is never stored on the blockchain—only deterministic SHA-256 hashes.
- **🏫 Institution Management:** Full dashboard for institutions to register their wallet addresses and track analytics.
- **📊 Analytics:** Live tracking of verification volumes, top certificates, and validity trends.
- **🚫 Revocation:** Admins can instantly revoke credentials with a cryptographic reason visible on verification lookups.

---

## Local Development Guide

To run CertChain locally, you will need **Node.js** (v18+ recommended) and **npm**. The project is split into three directories that must be run concurrently.

### 1. Start the Local Blockchain Node
First, spin up a local Hardhat JSON-RPC node. This provisions 20 test accounts populated with 10,000 fake ETH.
```bash
cd certchain-contract
npm install
npx hardhat node
```
*Leave this terminal running.*

### 2. Deploy the Smart Contract
Open a **new terminal** and deploy the registry contract to your local node.
```bash
cd certchain-contract
npx hardhat run scripts/deploy.js --network localhost
```
*Note the deployed contract address (though the server handles fallbacks automatically in development mode).*

### 3. Start the Backend API Server
The server proxies transactions between the frontend and the blockchain, and runs a lightweight in-memory MongoDB database.
```bash
cd certchain-server
npm install
npm run dev
```
*The server will start on `http://localhost:3001`.*

### 4. Start the Frontend Web App
Finally, spin up the React (Vite) client application.
```bash
cd certchain-frontend
npm install
npm run dev
```
*Visit the localhost URL (usually `http://localhost:5173`) in your browser.*

---

## Quick Testing Hints
- **Admin Dashboard:** Go to `/admin`.
- **Institution Registration:** Go to `/admin/institutions`. When asked for a wallet address, use one of the Hardhat test accounts generated in Step 1 (e.g., Account #1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`).
- **Bulk CSV Issuance:** Go to `/admin/bulk`. A helper file (`test-certificates.csv`) is provided in the frontend root directory to try issuing multiple certificates at once.

---

## Production Deployment (Key Details)
When migrating to production (`NODE_ENV=production`), the application enforces strict security:
- `MONGODB_URI` must be provided (it disables the memory server).
- `DEPLOYER_PRIVATE_KEY` must be set (it disables the Hardhat `#0` test key fallback).
- `POLYGON_AMOY_RPC_URL` is required to communicate with the actual testnet/mainnet node.
- The default React development warnings will be disabled.

---

*Built for advanced agentic coding standards.*
