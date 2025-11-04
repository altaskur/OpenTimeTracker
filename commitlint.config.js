module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation
        "style", // Formatting (no code changes)
        "refactor", // Refactoring
        "perf", // Performance improvement
        "test", // Tests
        "chore", // Maintenance tasks
        "ci", // CI/CD
        "revert", // Revert commit
      ],
    ],
  },
};
