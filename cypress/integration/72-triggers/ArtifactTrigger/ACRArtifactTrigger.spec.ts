/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getArtifactsACRContainerRegistries,
  getArtifactsACRContainerRegistryRepositories,
  getAzureSubscriptions
} from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getACRArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('ACR Artifact Trigger', () => {
  const { identifier, connectorId, subscriptionId, registry, repository, yaml } = getACRArtifactData()

  beforeEach(() => {
    cy.intercept('GET', getAzureSubscriptions({ connectorId }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Subscriptions.json'
    }).as('getAzureSubscriptions')
    cy.intercept('GET', getArtifactsACRContainerRegistries({ connectorId, subscriptionId }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_ACR_Container_Registries.json'
    }).as('getArtifactsACRContainerRegistries')
    cy.intercept('GET', getArtifactsACRContainerRegistryRepositories({ registry, connectorId, subscriptionId }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_ACR_Container_Registry_Repositories.json'
    }).as('getArtifactsACRContainerRegistryRepositories')
  })

  describe('1: Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_ACR'

    const fillArtifactData = (): void => {
      cy.wait(`@getAzureSubscriptions`)
      cy.get('input[name="subscriptionId"]').clear().type(subscriptionId)
      cy.contains('p', `Harness-Test: ${subscriptionId}`).click()
      cy.wait('@getArtifactsACRContainerRegistries')
      cy.get('input[name="registry"]').clear().type(registry)
      cy.contains('p', registry).click()
      cy.wait('@getArtifactsACRContainerRegistryRepositories')
      cy.get('input[name="repository"]').clear().type(repository)
      cy.contains('p', repository).click()
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
      cy.wait(`@getAzureSubscriptions`)
      cy.get('input[name="subscriptionId"]').should('have.value', `Harness-Test: ${subscriptionId}`)
      cy.wait('@getArtifactsACRContainerRegistries')
      cy.get('input[name="registry"]').should('have.value', registry)
      cy.wait('@getArtifactsACRContainerRegistryRepositories')
      cy.get('input[name="repository"]').should('have.value', repository)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
