import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config();

const SONAR_HOST = process.env.SONAR_HOST_URL || "http://localhost:9000";
const SONAR_TOKEN = process.env.SONAR_TOKEN;

if (!SONAR_TOKEN) {
  console.error("❌ SONAR_TOKEN not found in .env file");
  process.exit(1);
}

try {
  console.log(`🔍 Running SonarQube scanner on ${SONAR_HOST}...`);

  execSync(
    `sonar-scanner -Dsonar.host.url="${SONAR_HOST}" -Dsonar.token="${SONAR_TOKEN}" -Dsonar.login="${SONAR_TOKEN}"`,
    { stdio: "inherit" },
  );

  console.log("✅ SonarQube analysis completed");
} catch (error) {
  console.error("❌ SonarQube analysis failed:", error.message);
  process.exit(1);
}
