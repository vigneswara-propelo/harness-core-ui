/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAzureArtifactsFeeds, getAzureArtifactsPackages, getAzureArtifactsProjects } from '../constants'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { getAzureArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('Azure Artifacts Artifact Trigger', () => {
  const { identifier, connectorId, feed, pkg, projectScope, orgScope } = getAzureArtifactData()

  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_Azure Artifacts'

    describe('1: Project Scope', () => {
      const { project, maven, nuget } = projectScope

      describe('1.1: Maven Package Type', () => {
        const packageType = 'maven'
        const { yaml } = maven
        const fillArtifactData = (): void => {
          cy.get('input[name="project"]').focus()
          cy.wait('@getAzureArtifactsProjects')
          cy.get('input[name="project"]').clear().type(project)
          cy.contains('p', project).click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsProjects({ connectorId }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Projects.json'
          }).as('getAzureArtifactsProjects')
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
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
      describe('1.2: NuGet Package Type', () => {
        const packageType = 'nuget'
        const { yaml } = nuget

        const fillArtifactData = (): void => {
          cy.get('input[name="project"]').focus()
          cy.wait('@getAzureArtifactsProjects')
          cy.get('input[name="project"]').clear().type(project)
          cy.contains('p', project).click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="packageType"]').clear().type(packageType)
          cy.contains('p', 'NuGet').click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsProjects({ connectorId }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Projects.json'
          }).as('getAzureArtifactsProjects')
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('1.2.1: Pipeline Input', () => {
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
    describe('2: Org Scope', () => {
      const { scope, maven, nuget } = orgScope
      const project = ''
      describe('2.1: Maven Package Type', () => {
        const packageType = 'maven'
        const { yaml } = maven

        const fillArtifactData = (): void => {
          cy.get('input[name="scope"]').clear().type(scope)
          cy.contains('p', scope).click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('2.1.1: Pipeline Input', () => {
          fillArtifactTriggerData({
            artifactTypeCy,
            triggerName: identifier,
            connectorId,
            fillArtifactData,
            triggerYAML: yaml
          })
        })
      })
      describe('2.2: NuGet Package Type', () => {
        const packageType = 'nuget'
        const { yaml } = nuget

        const fillArtifactData = (): void => {
          cy.get('input[name="scope"]').clear().type(scope)
          cy.contains('p', 'Org').click()
          cy.get('input[name="feed"]').focus()
          cy.wait('@getAzureArtifactsFeeds')
          cy.get('input[name="feed"]').clear().type(feed)
          cy.contains('p', feed).click()
          cy.get('input[name="packageType"]').clear().type(packageType)
          cy.contains('p', 'NuGet').click()
          cy.get('input[name="package"]').focus()
          cy.wait('@getAzureArtifactsPackages')
          cy.get('input[name="package"]').clear().type(pkg)
          cy.contains('p', pkg).click()
        }

        beforeEach(() => {
          cy.intercept('GET', getAzureArtifactsFeeds({ connectorId, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Feeds.json'
          }).as('getAzureArtifactsFeeds')
          cy.intercept('GET', getAzureArtifactsPackages({ connectorId, packageType, feed, project }), {
            fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Azure_Artifacts_Packages.json'
          }).as('getAzureArtifactsPackages')
        })
        it('2.2.1: Pipeline Input', () => {
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
  })

  describe('2: Edit trigger', () => {
    describe('1: Project Scope', () => {
      const scope = 'Project'
      const { project, maven, nuget } = projectScope

      describe('1.1: Maven Package Type', () => {
        const packageType = 'Maven'
        const { yaml } = maven

        const checkArtifactData = (): void => {
          cy.get('input[name="scope"]').should('have.value', scope)
          cy.get('input[name="project"]').should('have.value', project)
          cy.get('input[name="feed"]').should('have.value', feed)
          cy.get('input[name="packageType"]').should('have.value', packageType)
          cy.get('input[name="package"]').should('have.value', pkg)
        }

        visitArtifactTriggerPage({ identifier, yaml })

        it('1.1.1: Pipeline Input', () => {
          editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
        })
      })
      describe('1.2: NuGet Package Type', () => {
        const packageType = 'NuGet'
        const { yaml } = nuget

        const checkArtifactData = (): void => {
          cy.get('input[name="scope"]').should('have.value', scope)
          cy.get('input[name="project"]').should('have.value', project)
          cy.get('input[name="feed"]').should('have.value', feed)
          cy.get('input[name="packageType"]').should('have.value', packageType)
          cy.get('input[name="package"]').should('have.value', pkg)
        }

        visitArtifactTriggerPage({ identifier, yaml })

        it('1.2.1: Pipeline Input', () => {
          editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
        })
      })
    })
    describe('2: Org Scope', () => {
      const { scope, maven, nuget } = orgScope
      describe('2.1: Maven Package Type', () => {
        const packageType = 'Maven'
        const { yaml } = maven

        const checkArtifactData = (): void => {
          cy.get('input[name="scope"]').should('have.value', scope)
          cy.get('input[name="feed"]').should('have.value', feed)
          cy.get('input[name="packageType"]').should('have.value', packageType)
          cy.get('input[name="package"]').should('have.value', pkg)
        }

        visitArtifactTriggerPage({ identifier, yaml })

        it('2.1.1: Pipeline Input', () => {
          editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
        })
      })
      describe('2.2: NuGet Package Type', () => {
        const packageType = 'NuGet'
        const { yaml } = nuget

        const checkArtifactData = (): void => {
          cy.get('input[name="scope"]').should('have.value', scope)
          cy.get('input[name="feed"]').should('have.value', feed)
          cy.get('input[name="packageType"]').should('have.value', packageType)
          cy.get('input[name="package"]').should('have.value', pkg)
        }

        visitArtifactTriggerPage({ identifier, yaml })

        it('2.2.1: Pipeline Input', () => {
          editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
        })
      })
    })
  })
})
