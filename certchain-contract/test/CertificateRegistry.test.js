import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("CertificateRegistry", function () {
  let CertificateRegistry, registry, owner, institution, student1, student2;
  const INSTITUTION_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INSTITUTION_ROLE"));

  beforeEach(async function () {
    [owner, institution, student1, student2] = await ethers.getSigners();
    CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    registry = await CertificateRegistry.deploy();
  });

  describe("Deployment & Roles", function () {
    it("Should assign the DEFAULT_ADMIN_ROLE to the deployer", async function () {
      const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
      expect(await registry.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should register an institution successfully", async function () {
      await expect(registry.registerInstitution(institution.address, "IIT Delhi"))
        .to.emit(registry, "InstitutionRegistered")
        .withArgs(institution.address, "IIT Delhi");
      
      expect(await registry.hasRole(INSTITUTION_ROLE, institution.address)).to.be.true;
      expect(await registry.registeredInstitutions(institution.address)).to.be.true;
    });
  });

  describe("Issuance & Verification", function () {
    beforeEach(async function () {
      await registry.registerInstitution(institution.address, "IIT Delhi");
    });

    it("Should issue a single certificate", async function () {
      const certId = ethers.keccak256(ethers.toUtf8Bytes("cert1"));
      const certHash = ethers.keccak256(ethers.toUtf8Bytes("data1"));

      await expect(registry.connect(institution).issueCertificate(certId, certHash))
        .to.emit(registry, "CertificateIssued")
        .withArgs(certId, certHash, institution.address, (await ethers.provider.getBlock('latest')).timestamp + 1);

      const cert = await registry.getCertificate(certId);
      expect(cert.certHash).to.equal(certHash);
      expect(cert.issuer).to.equal(institution.address);
      expect(cert.revoked).to.be.false;
    });

    it("Should batch issue certificates", async function () {
      const certIds = [ethers.keccak256(ethers.toUtf8Bytes("b1")), ethers.keccak256(ethers.toUtf8Bytes("b2"))];
      const hashes = [ethers.keccak256(ethers.toUtf8Bytes("h1")), ethers.keccak256(ethers.toUtf8Bytes("h2"))];

      await expect(registry.connect(institution).batchIssueCertificates(certIds, hashes))
        .to.emit(registry, "CertificateBatchIssued")
        .withArgs(certIds, institution.address, 2, (await ethers.provider.getBlock('latest')).timestamp + 1);

      const cert1 = await registry.getCertificate(certIds[0]);
      expect(cert1.certHash).to.equal(hashes[0]);
    });

    it("Should increment verification count upon verification", async function () {
        const certId = ethers.keccak256(ethers.toUtf8Bytes("cert1"));
        const certHash = ethers.keccak256(ethers.toUtf8Bytes("data1"));
        await registry.connect(institution).issueCertificate(certId, certHash);
  
        // Verification 1
        await expect(registry.verifyCertificate(certId))
          .to.emit(registry, "CertificateVerified")
          .withArgs(certId, owner.address, (await ethers.provider.getBlock('latest')).timestamp + 1);
        expect(await registry.verificationCount(certId)).to.equal(1);
    });
  });

  describe("Revocation", function () {
    let certId, certHash;

    beforeEach(async function () {
      await registry.registerInstitution(institution.address, "IIT Delhi");
      certId = ethers.keccak256(ethers.toUtf8Bytes("cert1"));
      certHash = ethers.keccak256(ethers.toUtf8Bytes("data1"));
      await registry.connect(institution).issueCertificate(certId, certHash);
    });

    it("Should revoke a certificate and emit event", async function () {
      await expect(registry.connect(institution).revokeCertificate(certId, "Fraudulent Issuance"))
        .to.emit(registry, "CertificateRevoked")
        .withArgs(certId, institution.address, "Fraudulent Issuance", (await ethers.provider.getBlock('latest')).timestamp + 1);

      const cert = await registry.getCertificate(certId);
      expect(cert.revoked).to.be.true;
      expect(cert.revokeReason).to.equal("Fraudulent Issuance");
    });

    it("Should prevent non-issuers from revoking", async function () {
      await expect(registry.connect(student1).revokeCertificate(certId, "Hacked"))
        .to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });
  });
});
