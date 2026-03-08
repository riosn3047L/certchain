import hardhat from 'hardhat';
const { ethers } = hardhat;

async function main() {
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const registry = await CertificateRegistry.deploy();

  await registry.waitForDeployment();
  const address = await registry.getAddress();

  console.log(`CertificateRegistry deployed to: ${address}`);

  // Register the local default issuer for testing
  const [owner] = await ethers.getSigners();
  const tx = await registry.registerInstitution(owner.address, "Test Institution");
  await tx.wait();

  console.log(`Registered root deployer as an institution: ${owner.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
