/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getArtifactsGithubPackages } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getGithubPackageRegistryArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Github Package Registry Artifact Trigger', () => {
  const { identifier, connectorId, org, packageName, yaml } = getGithubPackageRegistryArtifactData()
  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Github Package Registry'

    const fillArtifactData = (): void => {
      cy.get('input[name="org"]').clear().type(org)
      cy.get('input[name="packageName"]').focus()
      cy.wait('@getArtifactsGithubPackages')
      cy.get('input[name="packageName"]').clear().type(packageName)
      cy.contains('p', packageName).click()
    }

    beforeEach(() => {
      cy.intercept('GET', getArtifactsGithubPackages({ connectorId, org }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Github_Packages.json'
      }).as('getArtifactsGithubPackages')
    })

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

  describe('Edit trigger', () => {
    const checkArtifactData = (): void => {
      cy.get('input[name="org"]').should('have.value', org)
      cy.get('input[name="packageName"]').should('have.value', packageName)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
