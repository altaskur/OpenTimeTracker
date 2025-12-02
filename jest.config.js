module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/electron"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  globals: {
    "ts-jest": {
      tsconfig: "electron/tsconfig.spec.json",
    },
  },
  testPathIgnorePatterns: ["/node_modules/"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: [
    "electron/src/**/*.ts",
    "!electron/src/**/*.d.ts",
    "!electron/src/**/types.ts",
    "!electron/src/**/index.ts",
  ],
  coverageDirectory: "coverage/electron",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
