/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAWSRegions, getArtifactsECRGetImages } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getECRArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('ECR Artifact Trigger', () => {
  const { identifier, connectorId, regionLabel, imagePath, yaml } = getECRArtifactData()

  beforeEach(() => {
    cy.intercept('GET', getAWSRegions, {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_AWS_Regions.json'
    }).as('getAWSRegions')

    cy.intercept('POST', getArtifactsECRGetImages({ connectorId, region: 'us-east-1' }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_ECR_Images.json'
    }).as('getArtifactsECRGetImages')
  })

  describe('1: Create new trigger', () => {
    visitTriggersPage()

    const artifactTypeCy = 'Artifact_ECR'

    const fillArtifactData = (): void => {
      cy.wait('@getAWSRegions')
      cy.get('input[name="region"]').clear().type(regionLabel)
      cy.contains('p', regionLabel).click()
      cy.get('input[name="imagePath"]').focus()
      cy.wait('@getArtifactsECRGetImages')
      cy.get('input[name="imagePath"]').clear().type(imagePath)
      cy.contains('p', imagePath).click()
    }

    it('1.1: Pipeline Input', () => {
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
      cy.wait('@getAWSRegions')
      cy.get('input[name="region"]').should('have.value', regionLabel)
      cy.get('input[name="imagePath"]').should('have.value', imagePath)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
