module.exports = {
  "verbose": true,
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  testURL: 'http://localhost/browser-init-url#/hash-init-url',
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'router/**/*.js'
  ],
  "coverageReporters": ["html", "json", "lcov", "text", "clover"]
};
