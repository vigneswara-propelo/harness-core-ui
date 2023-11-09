import { defineConfig } from 'cypress'
import * as webpackPreprocessor from '@cypress/webpack-batteries-included-preprocessor'
import { v4 as namespace } from 'uuid'

export default defineConfig({
  e2e: {
    baseUrl: 'https://localhost:8181',
    specPattern: 'integration/**/*.spec.{ts,tsx}',
    supportFile: 'support/index.ts',
    fixturesFolder: 'fixtures',
    videoUploadOnPasses: false,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      reporterEnabled: 'spec, mocha-junit-reporter',
      mochaJunitReporterReporterOptions: {
        mochaFile: 'cypress-junit-[hash].xml'
      }
    },
    setupNodeEvents(on) {
      on('file:preprocessor', file => {
        const filePreprocessor = webpackPreprocessor({ typescript: 'typescript' })
        const id = namespace()
        file.outputPath = file.outputPath.replace(/^(.*\/)(.*?)(\..*)$/, `$1$2.${id}$3`)
        return filePreprocessor(file)
      })
    }
  },
  projectId: 'if5p69',
  viewportWidth: 1500,
  viewportHeight: 1000,
  retries: {
    runMode: 2,
    openMode: 0
  },
  fixturesFolder: 'fixtures',
  env: {
    //
  }
})
