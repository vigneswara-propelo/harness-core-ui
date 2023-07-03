/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getArtifactsArtifactoryImagePaths, getArtifactsArtifactoryRepositoriesDetails } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getArtifactoryArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Artifactory Registry Artifact Trigger', () => {
  const { identifier, connectorId, repository, generic, docker } = getArtifactoryArtifactData()

  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Artifactory'

    describe('1: Repository Format = Generic', () => {
      beforeEach(() => {
        cy.intercept('GET', getArtifactsArtifactoryRepositoriesDetails({ connectorId, repositoryType: 'generic' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Artifactory_Repositories_Details.json'
        }).as('getArtifactsArtifactoryRepositoriesDetails')
      })

      const { repositoryFormat, artifactDirectory, yaml } = generic
      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').click()
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getArtifactsArtifactoryRepositoriesDetails')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="artifactDirectory"]').clear().type(artifactDirectory)
      }

      it('1.1:  Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: yaml
        })
      })
    })
    describe('2: Repository Format = Docker', () => {
      beforeEach(() => {
        cy.intercept('GET', getArtifactsArtifactoryRepositoriesDetails({ connectorId, repositoryType: 'docker' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Artifactory_Repositories_Details.json'
        }).as('getArtifactsArtifactoryRepositoriesDetails')

        cy.intercept('GET', getArtifactsArtifactoryImagePaths({ connectorId, repository }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_Image_Paths.json'
        }).as('getArtifactsArtifactoryImagePaths')
      })

      const { repositoryFormat, artifactPath, repositoryUrl, yaml } = docker

      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').click()
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getArtifactsArtifactoryRepositoriesDetails')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="artifactPath"]').focus()
        cy.wait('@getArtifactsArtifactoryImagePaths')
        cy.get('input[name="artifactPath"]').clear().type(artifactPath)
        cy.contains('p', artifactPath).click()
        cy.get('input[name="repositoryUrl"]').clear().type(repositoryUrl)
      }
      it('2.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: yaml
        })
      })
    })
  })

  describe('2: Edit trigger', () => {
    describe('2.1: Repository Format = Generic', () => {
      const { repositoryFormat, artifactDirectory, yaml } = generic

      const checkArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
        cy.get('input[name="repository"]').should('have.value', repository)
        cy.get('input[name="artifactDirectory"]').should('have.value', artifactDirectory)
      }

      visitArtifactTriggerPage({ identifier, yaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
      })
    })
    describe('2.2: Repository Format = Docker', () => {
      const { repositoryFormat, artifactPath, repositoryUrl, yaml } = docker

      const checkArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
        cy.get('input[name="repository"]').should('have.value', repository)
        cy.get('input[name="artifactPath"]').should('have.value', artifactPath)
        cy.get('input[name="repositoryUrl"]').should('have.value', repositoryUrl)
      }
      visitArtifactTriggerPage({ identifier, yaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
      })
    })
  })
})
