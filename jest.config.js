module.exports = {
  "verbose": true,
  moduleFileExtensions: ['js'],
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'router/**/*.js'
  ],
  "coverageReporters": ["html", "json", "lcov", "text", "clover"]
};
