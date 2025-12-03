import "dotenv/config";

const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const PROJECT_KEY = "altaskur_OpenTimeTracker";

try {
  console.log(`🔍 Checking Quality Gate at ${SONAR_HOST}...`);

  const url = `${SONAR_HOST}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}`;

  // Create Basic Auth header with token
  const auth = Buffer.from(`${SONAR_TOKEN}:`).toString("base64");

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.projectStatus?.status !== "OK") {
    console.error("❌ Quality Gate FAILED");
    console.error("Details:", JSON.stringify(data.projectStatus, null, 2));
    process.exit(1);
  }

  console.log("✅ Quality Gate PASSED");
} catch (error) {
  console.error("❌ Error checking Quality Gate:", error.message);
  process.exit(1);
}
