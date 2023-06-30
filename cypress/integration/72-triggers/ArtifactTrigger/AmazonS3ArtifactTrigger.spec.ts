/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAWSRegions, getS3BucketsV2 } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getAmazonS3ArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Amazon S3 Artifact Trigger', () => {
  const { identifier, connectorId, region, bucketName, filePathRegex, yaml } = getAmazonS3ArtifactData()

  beforeEach(() => {
    cy.intercept('GET', getAWSRegions, {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_AWS_Regions.json'
    }).as('getAWSRegions')

    cy.intercept('GET', getS3BucketsV2({ connectorId, region }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_S3_Buckets_V2.json'
    }).as('getS3BucketsV2')
  })
  describe('1: Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Amazon S3'
    const fillArtifactData = (): void => {
      cy.wait('@getAWSRegions')
      cy.get('input[name="region"]').clear().type('US East')
      cy.contains('p', 'US East (N. Virginia)').click()
      cy.get('input[name="bucketName"]').focus()
      cy.wait('@getS3BucketsV2')
      cy.get('input[name="bucketName"]').clear().type(bucketName)
      cy.contains('p', bucketName).click()
      cy.get('input[name="filePathRegex"]').clear().type(filePathRegex)
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
      cy.get('input[name="region"]').should('have.value', 'US East (N. Virginia)')
      cy.get('input[name="bucketName"]').should('have.value', bucketName)
      cy.get('input[name="filePathRegex"]').should('have.value', filePathRegex)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
