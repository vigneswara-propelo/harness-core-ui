/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getCustomArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Custom Artifact Trigger', () => {
  const { identifier, script, artifactsArrayPath, versionPath, scriptInputVariables, yaml } = getCustomArtifactData()
  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Custom'

    const fillArtifactData = (): void => {
      cy.get('.react-monaco-editor-container').click().focused().type(script)
      cy.get('input[name="artifactsArrayPath"]').clear().type(artifactsArrayPath)
      cy.get('input[name="versionPath"]').clear().type(versionPath)
      scriptInputVariables.forEach((scriptInputVariable, index) => {
        const { name, type, value } = scriptInputVariable
        cy.contains('span', 'Add Input Variable').click()
        cy.get(`input[name="inputs.[${index}].name"]`).clear().type(name)
        cy.get(`input[name="inputs.[${index}].type"]`).clear().type(type)
        cy.contains('p', type).click()
        cy.get(`input[name="inputs.[${index}].value"]`).clear().type(value)
      })
    }

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName: identifier,
        fillArtifactData,
        triggerYAML: yaml
      })
    })
  })

  describe('2: Edit trigger', () => {
    const checkArtifactData = (): void => {
      cy.get('.react-monaco-editor-container').within(() => {
        cy.contains('span', 'echo').should('be.visible')
        cy.contains('span', 'Hello').should('be.visible')
        cy.contains('span', 'World').should('be.visible')
      })
      cy.get('input[name="artifactsArrayPath"]').should('have.value', artifactsArrayPath)
      cy.get('input[name="versionPath"]').should('have.value', versionPath)
      scriptInputVariables.forEach((scriptInputVariable, index) => {
        const { name, type, value } = scriptInputVariable
        cy.get(`input[name="inputs.[${index}].name"]`).should('have.value', name)
        cy.get(`input[name="inputs.[${index}].type"]`).should('have.value', type)
        cy.get(`input[name="inputs.[${index}].value"]`).should('have.value', value)
      })
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ checkArtifactData, yaml })
    })
  })
})
