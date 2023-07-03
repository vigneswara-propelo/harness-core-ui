/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { getBambooArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'
import { getBambooPlans, getBambooPaths } from '../constants'

describe('Bamboo Trigger', () => {
  const { identifier, connectorId, planKey, artifactPaths, yaml } = getBambooArtifactData()

  beforeEach(() => {
    cy.intercept('POST', getBambooPlans({ connectorId }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Bamboo_Plans.json'
    }).as('getBambooPlans')
    cy.intercept('POST', getBambooPaths({ connectorId, planKey }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Bamboo_Paths.json'
    }).as('getBambooPaths')
  })

  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Bamboo'

    const fillArtifactData = (): void => {
      cy.get('input[name="planKey"]').focus()
      cy.wait(`@getBambooPlans`)
      cy.get('input[name="planKey"]').clear().type(planKey)
      cy.contains('p', planKey).click()
      cy.wait(`@getBambooPaths`)
      artifactPaths.forEach(artifactPath => {
        cy.get('input[name="artifactPaths"]').clear().type(artifactPath)
        cy.contains('p', artifactPath).click()
      })
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
      cy.get('input[name="planKey"]').should('have.value', planKey)
      cy.wait(`@getBambooPaths`)
      artifactPaths.forEach(artifactPath => {
        cy.contains('span', artifactPath)
      })
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
