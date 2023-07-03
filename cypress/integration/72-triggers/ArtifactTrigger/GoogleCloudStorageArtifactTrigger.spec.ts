/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { getGoogleCloudStorageArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'
import { getGCPProjects, getGCPbuckets } from '../constants'

describe('Google Cloud Storage Trigger', () => {
  const { identifier, connectorId, project, bucket, yaml } = getGoogleCloudStorageArtifactData()

  beforeEach(() => {
    cy.intercept('POST', getGCPProjects({ connectorId }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_GCP_Projects.json'
    }).as('getGCPProjects')
    cy.intercept('POST', getGCPbuckets({ connectorId, project }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_GCP_Buckets.json'
    }).as('getGCPbuckets')
  })

  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Google Cloud Storage'

    const fillArtifactData = (): void => {
      cy.get('input[name="project"]').focus()
      cy.wait(`@getGCPProjects`)
      cy.get('input[name="project"]').clear().type(project)
      cy.contains('p', project).click()
      cy.get('input[name="bucket"]').focus()
      cy.wait(`@getGCPbuckets`)
      cy.get('input[name="bucket"]').clear().type(bucket)
      cy.contains('p', bucket).click()
    }

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName: identifier,
        connectorId,
        fillArtifactData,
        triggerYAML: yaml
      })
    })
  })

  describe('2: Edit trigger', () => {
    const checkArtifactData = (): void => {
      cy.get('input[name="project"]').should('have.value', project)
      cy.get('input[name="bucket"]').should('have.value', bucket)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
