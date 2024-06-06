module.exports = {
    
    testEnvironment: 'jsdom',
     setupFilesAfterEnv: ['<rootDir>/testsSetup.js'],
     "moduleNameMapper": {
        "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/fileMock.js"
      }
      
  };
