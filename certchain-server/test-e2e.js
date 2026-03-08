

async function run() {
  const issueUrl = 'http://localhost:3001/api/v1/certificates/issue';
  const issueBody = {
    student: {
      studentId: "CS999",
      degreeProgramme: "MTech",
      graduationYear: 2025,
      fullName: "Test User"
    },
    institutionAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    institutionName: "Verifier Institution"
  };

  try {
    const issueRes = await fetch(issueUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueBody)
    });
    const issueData = await issueRes.json();
    console.log("ISSUE RESPONSE:", issueData);

    if (!issueData.success) {
      console.error("Issuance failed, aborting verify test");
      return;
    }

    const certId = issueData.data.certId;
    console.log(`\nVerifying certId: ${certId}`);

    const verifyUrl = `http://localhost:3001/api/v1/certificates/verify/${certId}`;
    const verifyRes = await fetch(verifyUrl);
    const verifyData = await verifyRes.json();
    console.log("VERIFY RESPONSE:", verifyData);
    
  } catch (e) {
    console.error("Test Error:", e);
  }
}

run();
