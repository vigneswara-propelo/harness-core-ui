/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getArtifactsJenkinsChildJobs, getArtifactsJenkinsJobPaths, getArtifactsJenkinsJobs } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'
import { getJenkinsArtifactData } from './ArtifactTriggerConfig'

describe('Jenkins Artifact Trigger', () => {
  const { identifier, connectorId, jobName, parentJobName, childJobName, artifactPath, parentJobYaml, childJobYaml } =
    getJenkinsArtifactData()
  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Jenkins'

    beforeEach(() => {
      cy.intercept('GET', getArtifactsJenkinsJobs({ connectorId }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Jobs.json'
      }).as('getArtifactsJenkinsJobs')
    })

    describe('1: With parent job only', () => {
      const fillArtifactData = (): void => {
        cy.wait('@getArtifactsJenkinsJobs')
        cy.get('input[name="jobName"]').clear().type(jobName)
        cy.contains('p', jobName).click()
        cy.get('input[name="artifactPath"]').focus()
        cy.wait('@getArtifactsJenkinsJobPaths')
        cy.get('input[name="artifactPath"]').clear().type(artifactPath)
        cy.contains('p', artifactPath).click()
      }

      beforeEach(() => {
        cy.intercept('GET', getArtifactsJenkinsJobPaths({ connectorId, job: encodeURIComponent(jobName) }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Job_Path.json'
        }).as('getArtifactsJenkinsJobPaths')
      })

      it('1.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: parentJobYaml
        })
      })
    })
    describe('2: With parent and child job', () => {
      const fillArtifactData = (): void => {
        cy.wait('@getArtifactsJenkinsJobs')
        cy.get('input[name="jobName"]').clear().type(parentJobName)
        cy.contains('p', parentJobName).click()
        cy.wait('@getArtifactsJenkinsChildJobs')
        cy.get('input[name="childJobName"]').clear().type(childJobName)
        cy.contains('p', childJobName).click()
        cy.get('input[name="artifactPath"]').focus()
        cy.wait('@getArtifactsJenkinsJobParentChildPaths')
        cy.get('input[name="artifactPath"]').clear().type(artifactPath)
        cy.contains('p', artifactPath).click()
      }

      beforeEach(() => {
        cy.intercept('GET', getArtifactsJenkinsChildJobs({ connectorId, parentJobName: parentJobName }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Child_Jobs.json'
        }).as('getArtifactsJenkinsChildJobs')
        cy.intercept('GET', getArtifactsJenkinsJobPaths({ connectorId, job: encodeURIComponent(childJobName) }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Job_Path.json'
        }).as('getArtifactsJenkinsJobParentChildPaths')
      })

      it('2.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: childJobYaml
        })
      })
    })
  })

  describe('2: Edit trigger', () => {
    beforeEach(() => {
      cy.intercept('GET', getArtifactsJenkinsJobs({ connectorId }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Jobs.json'
      }).as('getArtifactsJenkinsJobs')
    })

    describe('1: With parent job only', () => {
      const checkArtifactData = (): void => {
        cy.wait('@getArtifactsJenkinsJobs')
        cy.get('input[name="jobName"]').should('have.value', jobName)
        cy.get('input[name="artifactPath"]').should('have.value', artifactPath)
      }

      visitArtifactTriggerPage({ identifier, yaml: parentJobYaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml: parentJobYaml })
      })
    })
    describe('2: With parent and child job', () => {
      const checkArtifactData = (): void => {
        cy.wait('@getArtifactsJenkinsJobs')
        cy.get('input[name="jobName"]').should('have.value', parentJobName)
        cy.wait('@getArtifactsJenkinsChildJobs')
        cy.get('input[name="childJobName"]').should('have.value', childJobName)
        cy.get('input[name="artifactPath"]').should('have.value', artifactPath)
      }

      beforeEach(() => {
        cy.intercept('GET', getArtifactsJenkinsChildJobs({ connectorId, parentJobName: parentJobName }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Child_Jobs.json'
        }).as('getArtifactsJenkinsChildJobs')
        cy.intercept('GET', getArtifactsJenkinsJobPaths({ connectorId, job: encodeURIComponent(childJobName) }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Jenkins_Job_Path.json'
        }).as('getArtifactsJenkinsJobParentChildPaths')
      })

      visitArtifactTriggerPage({ identifier, yaml: childJobYaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml: childJobYaml })
      })
    })
  })
})
