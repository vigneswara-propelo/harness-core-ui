/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAWSRegions, getArtifactsAMITags } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getAmazonMachineImageArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Amazon Machine Image Artifact Trigger', () => {
  const { identifier, connectorId, region, regionLabel, tags, filter, yaml } = getAmazonMachineImageArtifactData()

  beforeEach(() => {
    cy.intercept('GET', getAWSRegions, {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_AWS_Regions.json'
    }).as('getAWSRegions')

    cy.intercept('POST', getArtifactsAMITags({ connectorId, region }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_AMI_Tags.json'
    }).as('getArtifactsAMITags')
  })
  describe('1: Create new trigger', () => {
    visitTriggersPage()

    const artifactTypeCy = 'Artifact_Amazon Machine Image'

    const fillArtifactData = (): void => {
      cy.wait(`@getAWSRegions`)
      cy.get('input[name="region"]').clear().type(regionLabel)
      cy.contains('p', regionLabel).click()
      cy.wait('@getArtifactsAMITags')
      tags.forEach(({ name, value }, index) => {
        cy.contains('span.bp3-button-text', 'AMI Tags').click()
        cy.get(`input[name="tags[${index}].name"]`).clear().type(name)
        cy.contains('p', name).click()
        cy.get(`input[name="tags[${index}].value"]`).clear().type(value)
      })
      filter.forEach(({ name, value }, index) => {
        cy.contains('span.bp3-button-text', 'AMI Filters').click({ force: true })
        cy.get(`input[name="filters[${index}].name"]`).clear().type(name)
        cy.contains('p', name).click()
        cy.get(`input[name="filters[${index}].value"]`).clear().type(value)
      })
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
      cy.wait(`@getAWSRegions`)
      cy.get('input[name="region"]').should('have.value', regionLabel)
      cy.wait('@getArtifactsAMITags')
      tags.forEach(({ name, value }, index) => {
        cy.get(`input[name="tags[${index}].name"]`).should('have.value', name)
        cy.get(`input[name="tags[${index}].value"]`).should('have.value', value)
      })
      filter.forEach(({ name, value }, index) => {
        cy.get(`input[name="filters[${index}].name"]`).should('have.value', name)
        cy.get(`input[name="filters[${index}].value"]`).should('have.value', value)
      })
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
