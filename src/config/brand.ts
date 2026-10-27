// Brand copy copied from ai-research-platform-fe/src/config/app-config.ts.
export const BRAND = {
  name: "OpenAI Scientist",
  tagline:
    "From a research idea to a validated, evidence-based scientific report.",
  independence: "Independent project. Not affiliated with OpenAI.",
};

// Set this to the deployed frontend origin when shipping the landing separately.
const appOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
export const APP_LOGIN_URL = new URL("/auth/login", appOrigin).toString();
