/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getNexusArtifactIds, getNexusGroupIds, getNexusRepositories } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getNexus3ArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Nexus3 Artifact Trigger', () => {
  const {
    identifier,
    connectorId,
    dockerRepositoryFormat,
    mavenRepositoryFormat,
    npmRepositoryFormat,
    nugetRepositoryFormat,
    rawRepositoryFormat
  } = getNexus3ArtifactData()
  describe('Create new trigger', () => {
    visitTriggersPage()

    const artifactTypeCy = 'Artifact_Nexus3'

    describe('1: Docker Repository Format', () => {
      const { repository, artifactPath, repositoryUrl, repositoryPort, repositoryUrlYaml, repositoryPortYaml } =
        dockerRepositoryFormat

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'docker' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      describe('1.1: Repository Url', () => {
        const fillArtifactData = (): void => {
          cy.get('input[name="repository"]').focus()
          cy.wait('@getNexusRepositories')
          cy.get('input[name="repository"]').clear().type(repository)
          cy.contains('p', repository).click()
          cy.get('input[name="artifactPath"]').clear().type(artifactPath)
          cy.get('input[name="repositoryUrl"]').clear().type(repositoryUrl)
        }

        it('1.1.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName: identifier,
            connectorId,
            fillArtifactData,
            triggerYAML: repositoryUrlYaml
          })
        })
      })
      describe('1.2: Repository Port', () => {
        const fillArtifactData = (): void => {
          cy.get('input[name="repository"]').focus()
          cy.wait('@getNexusRepositories')
          cy.get('input[name="repository"]').clear().type(repository)
          cy.contains('p', repository).click()
          cy.get('input[name="artifactPath"]').clear().type(artifactPath)
          cy.get('input[name="repositoryPortorRepositoryURL"]').check('repositoryPort', { force: true })
          cy.get('input[name="repositoryPort"]').clear().type(repositoryPort)
        }

        it('1.2.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName: identifier,
            connectorId,
            fillArtifactData,
            triggerYAML: repositoryPortYaml
          })
        })
      })
    })
    describe('2: Maven Repository Format', () => {
      const { repositoryFormat, repository, groupId, artifactId, extension, classifier, yaml } = mavenRepositoryFormat

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'maven' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
        cy.intercept('POST', getNexusGroupIds({ connectorId, repositoryFormat: 'maven', repository }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Group_Ids.json'
        }).as('getNexusGroupId')
        cy.intercept('POST', getNexusArtifactIds({ connectorId, repositoryFormat: 'maven', repository }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Artifact_Ids.json'
        }).as('getNexusArtifactId')
      })

      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="groupId"]').focus()
        cy.wait('@getNexusGroupId')
        cy.get('input[name="groupId"]').clear().type(groupId)
        cy.contains('p', groupId).click()
        cy.get('input[name="artifactId"]').focus()
        cy.wait('@getNexusArtifactId')
        cy.get('input[name="artifactId"]').clear().type(artifactId)
        cy.contains('p', artifactId).click()
        cy.get('input[name="extension"]').clear().type(extension)
        cy.get('input[name="classifier"]').clear().type(classifier)
      }

      it('1.1.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: yaml
        })
      })
    })
    describe('3: NPM Repository Format', () => {
      const { repositoryFormat, repository, packageName, yaml } = npmRepositoryFormat

      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="packageName"]').clear().type(packageName)
      }

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'npm' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      it('3.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: yaml
        })
      })
    })
    describe('4: NuGet Repository Format', () => {
      const { repositoryFormat, repository, packageName, yaml } = nugetRepositoryFormat

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'nuget' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="packageName"]').clear().type(packageName)
      }

      it('4.1: Pipeline Input', () => {
        fillArtifactTriggerData({
          artifactTypeCy,
          triggerName: identifier,
          connectorId,
          fillArtifactData,
          triggerYAML: yaml
        })
      })
    })
    describe('5: Raw Repository Format', () => {
      const { repositoryFormat, repository, group, yaml } = rawRepositoryFormat

      const fillArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').clear().type(repositoryFormat)
        cy.contains('p', repositoryFormat).click()
        cy.get('input[name="repository"]').focus()
        cy.wait('@getNexusRepositories')
        cy.get('input[name="repository"]').clear().type(repository)
        cy.contains('p', repository).click()
        cy.get('input[name="group"]').clear().type(group)
      }

      beforeEach(() => {
        cy.intercept('POST', getNexusRepositories({ connectorId, repositoryFormat: 'raw' }), {
          fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Nexus_Repositories.json'
        }).as('getNexusRepositories')
      })

      it('5.1: Pipeline Input', () => {
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
    describe('1: Docker Repository Format', () => {
      const {
        repositoryFormat,
        repository,
        artifactPath,
        repositoryUrl,
        repositoryPort,
        repositoryUrlYaml,
        repositoryPortYaml
      } = dockerRepositoryFormat

      describe('1.1: Repository Url', () => {
        const checkArtifactData = (): void => {
          cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
          cy.get('input[name="repository"]').should('have.value', repository)
          cy.get('input[name="artifactPath"]').should('have.value', artifactPath)
          cy.get('input[name="repositoryPortorRepositoryURL"][value="repositoryUrl"]').should('be.checked')
          cy.get('input[name="repositoryUrl"]').should('have.value', repositoryUrl)
        }

        visitArtifactTriggerPage({ identifier, yaml: repositoryUrlYaml })

        it('2.1: Pipeline Input', () => {
          editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml: repositoryUrlYaml })
        })
      })
      describe('1.2: Repository Port', () => {
        const checkArtifactData = (): void => {
          cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
          cy.get('input[name="repository"]').should('have.value', repository)
          cy.get('input[name="artifactPath"]').should('have.value', artifactPath)
          cy.get('input[name="repositoryPortorRepositoryURL"][value="repositoryPort"]').should('be.checked')
          cy.get('input[name="repositoryPort"]').should('have.value', repositoryPort)
        }

        visitArtifactTriggerPage({ identifier, yaml: repositoryPortYaml })

        it('2.1: Pipeline Input', () => {
          editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml: repositoryPortYaml })
        })
      })
    })
    describe('2: Maven Repository Format', () => {
      const { repositoryFormat, repository, groupId, artifactId, extension, classifier, yaml } = mavenRepositoryFormat

      const checkArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
        cy.get('input[name="repository"]').should('have.value', repository)
        cy.get('input[name="groupId"]').should('have.value', groupId)
        cy.get('input[name="artifactId"]').should('have.value', artifactId)
        cy.get('input[name="extension"]').should('have.value', extension)
        cy.get('input[name="classifier"]').should('have.value', classifier)
      }

      visitArtifactTriggerPage({ identifier, yaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
      })
    })
    describe('3: NPM Repository Format', () => {
      const { repositoryFormat, repository, packageName, yaml } = npmRepositoryFormat

      const checkArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
        cy.get('input[name="repository"]').should('have.value', repository)
        cy.get('input[name="packageName"]').should('have.value', packageName)
      }

      visitArtifactTriggerPage({ identifier, yaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
      })
    })
    describe('4: NuGet Repository Format', () => {
      const { repositoryFormat, repository, packageName, yaml } = nugetRepositoryFormat

      const checkArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
        cy.get('input[name="repository"]').should('have.value', repository)
        cy.get('input[name="packageName"]').should('have.value', packageName)
      }

      visitArtifactTriggerPage({ identifier, yaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
      })
    })
    describe('5: Raw Repository Format', () => {
      const { repositoryFormat, repository, group, yaml } = rawRepositoryFormat

      const checkArtifactData = (): void => {
        cy.get('input[name="repositoryFormat"]').should('have.value', repositoryFormat)
        cy.get('input[name="repository"]').should('have.value', repository)
        cy.get('input[name="group"]').should('have.value', group)
      }

      visitArtifactTriggerPage({ identifier, yaml })

      it('2.1: Pipeline Input', () => {
        editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
      })
    })
  })
})
