// Full E2E test: issue → verify → analytics → revoke → verify again
async function fullTest() {
  console.log("=== FULL E2E BACKEND TEST ===\n");

  // 1. Issue a certificate
  console.log("1. Issuing certificate...");
  const issueRes = await fetch('http://localhost:3001/api/v1/certificates/issue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student: { fullName: "Test Graduate", studentId: "E2E001", degreeProgramme: "B.Tech CS", graduationYear: 2025 },
      institutionAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      institutionName: "E2E Test University"
    })
  });
  const issueData = await issueRes.json();
  console.log(`   Status: ${issueRes.status} | Success: ${issueData.success}`);
  console.log(`   CertID: ${issueData.data?.certId}\n`);

  const certId = issueData.data?.certId;
  if (!certId) { console.error("ABORT: No certId"); return; }

  // 2. Verify the certificate
  console.log("2. Verifying certificate...");
  const verifyRes = await fetch(`http://localhost:3001/api/v1/certificates/verify/${certId}`);
  const verifyData = await verifyRes.json();
  console.log(`   Status: ${verifyRes.status} | Verification: ${verifyData.status}`);
  console.log(`   Student: ${verifyData.data?.studentName}, Degree: ${verifyData.data?.degree}\n`);

  // 3. Check analytics
  console.log("3. Checking analytics...");
  const analyticsRes = await fetch('http://localhost:3001/api/v1/analytics/overview');
  const analyticsData = await analyticsRes.json();
  console.log(`   Issued: ${analyticsData.data?.totalIssued}, Active: ${analyticsData.data?.totalActive}, Verifications: ${analyticsData.data?.totalVerifications}\n`);

  // 4. List certificates
  console.log("4. Listing certificates...");
  const listRes = await fetch('http://localhost:3001/api/v1/certificates');
  const listData = await listRes.json();
  console.log(`   Total: ${listData.meta?.total}, First: ${listData.data?.[0]?.student?.fullName}\n`);

  // 5. Revoke the certificate
  console.log("5. Revoking certificate...");
  const revokeRes = await fetch(`http://localhost:3001/api/v1/certificates/${certId}/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: "E2E Test Revocation" })
  });
  const revokeData = await revokeRes.json();
  console.log(`   Status: ${revokeRes.status} | Success: ${revokeData.success} | Reason: ${revokeData.data?.reason}\n`);

  // 6. Verify revoked certificate
  console.log("6. Re-verifying (should be revoked)...");
  const reVerifyRes = await fetch(`http://localhost:3001/api/v1/certificates/verify/${certId}`);
  const reVerifyData = await reVerifyRes.json();
  console.log(`   Status: ${reVerifyRes.status} | Verification: ${reVerifyData.status}`);
  console.log(`   Revoke Reason: ${reVerifyData.data?.reason}\n`);

  // 7. Final analytics
  console.log("7. Final analytics...");
  const finalAnalytics = await fetch('http://localhost:3001/api/v1/analytics/overview');
  const finalData = await finalAnalytics.json();
  console.log(`   Issued: ${finalData.data?.totalIssued}, Active: ${finalData.data?.totalActive}, Revoked: ${finalData.data?.totalRevoked}, Verifications: ${finalData.data?.totalVerifications}\n`);

  console.log("=== ALL TESTS COMPLETE ===");
}

fullTest();
