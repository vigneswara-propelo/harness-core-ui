/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getGARRegions, getGARRepo } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getGoogleArtifactRegistryTriggerArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Google Artifact Registry Artifact Trigger', () => {
  const { identifier, connectorId, project, region, repositoryName, pkg, yaml } =
    getGoogleArtifactRegistryTriggerArtifactData()

  beforeEach(() => {
    cy.intercept('GET', getGARRegions, {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_GAR_Regions.json'
    }).as('getGARRegions')

    cy.intercept('GET', getGARRepo({ connectorId, region, project }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_GAR_Repo.json'
    }).as('getGARRepo')
  })

  describe('1: Create new trigger', () => {
    visitTriggersPage()

    const artifactTypeCy = 'Artifact_Google Artifact Registry'

    const fillArtifactData = (): void => {
      cy.wait('@getGARRegions')
      cy.get('input[name="project"]').clear().type(project)
      cy.get('input[name="region"]').clear().type(region)
      cy.contains('p', region).click()
      cy.get('input[name="repositoryName"]').clear().type(repositoryName)
      cy.contains('p', repositoryName).should('be.visible').click()
      cy.get('input[name="package"]').clear().type(pkg)
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
      cy.wait('@getGARRegions')
      cy.get('input[name="project"]').should('have.value', project)
      cy.get('input[name="region"]').should('have.value', region)
      cy.get('input[name="repositoryName"]').should('have.value', repositoryName)
      cy.get('input[name="package"]').should('have.value', pkg)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
