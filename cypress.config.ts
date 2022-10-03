import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'm61d2o',
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 	'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/*', '**/2-advanced-examples/*']
  },

  // video: false,
  retries: {
    runMode: 2,
    openMode: 1
  },

  env: {
    email: "grzegorz94@test.com",
    password: "password123",
    apiUrl: "https://api.realworld.io/api/"
  },

  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json'
  }
});
