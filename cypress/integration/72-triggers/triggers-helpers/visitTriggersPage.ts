import { parse } from 'yaml'
import {
  inputSetsTemplateCall,
  pipelineDetails,
  pipelineDetailsWithRoutingIdCall,
  pipelineInputSetTemplate,
  triggersRoute,
  triggerRoute,
  pipelineSummaryCallAPI,
  featureFlagsCall,
  accountId,
  orgIdentifier,
  projectId,
  pipelineIdentifier
} from '../../../support/70-pipeline/constants'
import { getTriggerAPI, getTriggerCatalogAPI, getTriggerListAPI, mergeInputSets, updateTriggerAPI } from '../constants'

export const visitTriggersPage = (
  getTriggerListAPIFixture = 'pipeline/api/triggers/Cypress_Test_Trigger_Get_Empty_Trigger_List.json'
): void => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          { uuid: null, name: 'NG_SVC_ENV_REDESIGN', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'BAMBOO_ARTIFACT_NG', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'CDS_NG_TRIGGER_MULTI_ARTIFACTS', enabled: true, lastUpdatedAt: 0 }
        ]
      })

      cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline.json' }).as(
        'pipelineDetails'
      )

      cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline.json'
      })

      cy.intercept('POST', pipelineSummaryCallAPI, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_Summary.json'
      })

      cy.intercept('POST', inputSetsTemplateCall, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_Input_Sets_Template.json'
      })

      cy.intercept('GET', pipelineInputSetTemplate, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Templates_Apply_Templates.json'
      })

      cy.intercept('GET', getTriggerCatalogAPI, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Catalog.json'
      })

      cy.fixture(getTriggerListAPIFixture).then(getTriggerListAPIData => {
        cy.intercept('GET', getTriggerListAPI, {
          fixture: getTriggerListAPIFixture
        })

        cy.initializeRoute()
        cy.visit(triggersRoute, {
          timeout: 30000
        })

        if (getTriggerListAPIData.data.totalPages) {
          cy.visitPageAssertion('.TableV2--table')
        } else {
          cy.visitPageAssertion('.NoDataCard--buttonContainer')
        }
      })
    })
  })
}

export const visitTriggerPage = ({
  name,
  identifier,
  enabled = true,
  type,
  yaml
}: {
  name?: string
  identifier: string
  enabled?: boolean
  type: string
  yaml: string
}): void => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          { uuid: null, name: 'NG_SVC_ENV_REDESIGN', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'BAMBOO_ARTIFACT_NG', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'CDS_NEXUS_GROUPID_ARTIFACTID_DROPDOWN', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'CDS_NG_TRIGGER_MULTI_ARTIFACTS', enabled: true, lastUpdatedAt: 0 }
        ]
      })

      cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline.json' }).as(
        'pipelineDetails'
      )

      cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline.json'
      })

      cy.intercept('POST', inputSetsTemplateCall, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_Input_Sets_Template.json'
      })

      cy.intercept('GET', pipelineInputSetTemplate, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Templates_Apply_Templates.json'
      })

      cy.intercept('GET', getTriggerAPI(identifier), {
        body: getGetTriggerAPIResponse({ name, identifier, type, yaml, enabled })
      }).as('getTrigger')

      const inputYaml = parse(yaml)?.trigger?.inputYaml

      cy.intercept('POST', mergeInputSets, {
        body: {
          status: 'SUCCESS',
          data: {
            pipelineYaml: inputYaml
          }
        }
      }).as('mergeInputSets')

      cy.intercept('PUT', updateTriggerAPI(identifier)).as('updateTriggerAPI')

      cy.initializeRoute()
      cy.visit(triggerRoute(identifier), {
        timeout: 30000
      })

      cy.wait('@getTrigger', { timeout: 30_000 })

      if (inputYaml) {
        cy.wait('@mergeInputSets')
      }
    })
  })
}

const getGetTriggerAPIResponse = ({
  name,
  identifier,
  enabled = true,
  type,
  yaml
}: {
  name?: string
  identifier: string
  enabled?: boolean
  type: string
  yaml: string
}): Record<string, any> => ({
  status: 'SUCCESS',
  data: {
    name: name ?? identifier,
    identifier: identifier,
    description: '',
    type,
    accountIdentifier: accountId,
    orgIdentifier: orgIdentifier,
    projectIdentifier: projectId,
    targetIdentifier: pipelineIdentifier,
    yaml,
    enabled,
    errorResponse: false,
    stagesToExecute: []
  }
})
