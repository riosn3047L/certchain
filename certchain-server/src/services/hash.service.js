import crypto from 'crypto';

/**
 * Deterministically stringifies an object by sorting its keys.
 */
function deterministicStringify(obj) {
  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};
  for (let key of sortedKeys) {
    sortedObj[key] = obj[key];
  }
  return JSON.stringify(sortedObj);
}

/**
 * Computes a SHA-256 hash for a certificate's off-chain data.
 * @param {Object} data - The certificate details
 * @returns {string} - "0x" prefixed bytes32 hex string
 */
export const hashCertificateData = (data) => {
  const jsonStr = deterministicStringify(data);
  const hash = crypto.createHash('sha256').update(jsonStr).digest('hex');
  return `0x${hash}`;
};

/**
 * Generates a globally unique bytes32 ID for a certificate.
 */
export const generateCertificateId = (issuerAddress, studentId, degreeType, year) => {
  const nonce = Date.now().toString() + Math.random().toString();
  const rawString = `${issuerAddress}-${studentId}-${degreeType}-${year}-${nonce}`;
  const hash = crypto.createHash('sha256').update(rawString).digest('hex');
  return `0x${hash}`;
};
