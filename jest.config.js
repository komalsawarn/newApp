// module.exports = {
//   testEnvironment: "node",
//   moduleFileExtensions: ["js", "ts", "json", "node"],
//   // setupFilesAfterEnv: ['./jest.setup.js'],
//   testMatch: ["**/src/**/*.test.(js|ts)"],
// };

// filepath: /Users/himanshukhandelwal/komal/newApp/jest.config.mjs
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json", "node"],
  testMatch: ["**/src/**/*.test.(js|ts)"],
};
