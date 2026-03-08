// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertificateRegistry
 * @dev On-chain registry for issuing, batching, and revoking academic certificate hashes.
 */
contract CertificateRegistry is AccessControl {
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    struct Certificate {
        bytes32 certHash;         // SHA-256 hash of off-chain data
        address issuer;           // Institution wallet that issued
        uint256 issuedAt;         // Block timestamp of issuance
        bool revoked;             // Revocation flag
        string revokeReason;      // Reason for revocation (empty if active)
        uint256 revokedAt;        // Timestamp of revocation (0 if active)
    }

    // Primary storage
    mapping(bytes32 => Certificate) public certificates;    // certId => Certificate
    mapping(address => bool) public registeredInstitutions; // institution wallet => active

    // Analytics counters (on-chain, lightweight)
    mapping(bytes32 => uint256) public verificationCount;   // certId => count

    // Events
    event InstitutionRegistered(address indexed institution, string name);
    event CertificateIssued(bytes32 indexed certId, bytes32 indexed certHash, address indexed issuer, uint256 timestamp);
    event CertificateBatchIssued(bytes32[] certIds, address indexed issuer, uint256 count, uint256 timestamp);
    event CertificateRevoked(bytes32 indexed certId, address indexed issuer, string reason, uint256 timestamp);
    event CertificateVerified(bytes32 indexed certId, address indexed verifier, uint256 timestamp);

    // Modifiers
    modifier onlyIssuer(bytes32 certId) {
        require(certificates[certId].issuer == msg.sender, "CertificateRegistry: Not the issuer");
        _;
    }

    modifier certExists(bytes32 certId) {
        require(certificates[certId].issuedAt != 0, "CertificateRegistry: Certificate does not exist");
        _;
    }

    modifier notRevoked(bytes32 certId) {
        require(!certificates[certId].revoked, "CertificateRegistry: Certificate is fully revoked");
        _;
    }

    /**
     * @dev Grant `DEFAULT_ADMIN_ROLE` to the deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Admin function to register an institution to allow them to issue credentials.
     */
    function registerInstitution(address institution, string memory name) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!registeredInstitutions[institution], "Institution already registered");
        require(bytes(name).length > 0, "Name cannot be empty");

        _grantRole(INSTITUTION_ROLE, institution);
        registeredInstitutions[institution] = true;

        emit InstitutionRegistered(institution, name);
    }

    /**
     * @dev Institution function to issue a single certificate.
     */
    function issueCertificate(bytes32 certId, bytes32 certHash) external onlyRole(INSTITUTION_ROLE) {
        require(certificates[certId].issuedAt == 0, "CertificateRegistry: Certificate ID already exists");

        certificates[certId] = Certificate({
            certHash: certHash,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false,
            revokeReason: "",
            revokedAt: 0
        });

        emit CertificateIssued(certId, certHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Batch issue multiple certificates in one transaction. Max 50 per batch.
     */
    function batchIssueCertificates(
        bytes32[] calldata certIds,
        bytes32[] calldata certHashes
    ) external onlyRole(INSTITUTION_ROLE) {
        uint256 length = certIds.length;
        require(length == certHashes.length, "CertificateRegistry: Array length mismatch");
        require(length <= 50, "CertificateRegistry: Max 50 certificates per batch");
        require(length > 0, "CertificateRegistry: Empty batch");

        for (uint256 i = 0; i < length; i++) {
            require(certificates[certIds[i]].issuedAt == 0, "CertificateRegistry: Certificate ID already exists in batch");

            certificates[certIds[i]] = Certificate({
                certHash: certHashes[i],
                issuer: msg.sender,
                issuedAt: block.timestamp,
                revoked: false,
                revokeReason: "",
                revokedAt: 0
            });
        }

        emit CertificateBatchIssued(certIds, msg.sender, length, block.timestamp);
    }

    /**
     * @dev Permanently revoke an issued certificate. Can only be un-done by rewriting a new certId.
     */
    function revokeCertificate(bytes32 certId, string memory reason) 
        external 
        onlyRole(INSTITUTION_ROLE) 
        certExists(certId) 
        onlyIssuer(certId) 
        notRevoked(certId) 
    {
        certificates[certId].revoked = true;
        certificates[certId].revokeReason = reason;
        certificates[certId].revokedAt = block.timestamp;

        emit CertificateRevoked(certId, msg.sender, reason, block.timestamp);
    }

    /**
     * @dev Validates a certificate exists and increments the verification counter.
     */
    function verifyCertificate(bytes32 certId) external certExists(certId) returns (Certificate memory) {
        verificationCount[certId] += 1;
        emit CertificateVerified(certId, msg.sender, block.timestamp);
        return certificates[certId];
    }

    /**
     * @dev View function to get a certificate without incrementing the interaction counter.
     */
    function getCertificate(bytes32 certId) external view returns (Certificate memory) {
        return certificates[certId];
    }
}
