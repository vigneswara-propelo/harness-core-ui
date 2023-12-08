/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  featureFlagsCall,
  inputSetsTemplateCall,
  newTriggerRoute,
  pipelineDetailsWithRoutingIdCall,
  pipelineInputSetTemplate,
  pipelineSummaryCallAPI,
  triggersMergeCall
} from '../../support/70-pipeline/constants'

describe('Triggers Input set view', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          { uuid: null, name: 'NG_SVC_ENV_REDESIGN', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'BAMBOO_ARTIFACT_NG', enabled: true, lastUpdatedAt: 0 }
        ]
      })

      cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
        fixture: 'pipeline/api/triggers/triggerISPipelineResponse.json'
      }).as('pipelineDetails')

      cy.intercept('GET', pipelineSummaryCallAPI, {
        fixture: 'pipeline/api/triggers/triggerISPipelineWithoutResolvedTemplateResponse.json'
      })

      cy.intercept('POST', inputSetsTemplateCall, {
        fixture: 'pipeline/api/triggers/triggerISTemplateResponse.json'
      })

      cy.intercept('GET', pipelineInputSetTemplate, {
        fixture: 'pipeline/api/triggers/triggerISApplyTemplatesResponse.json'
      })
      cy.intercept('GET', triggersMergeCall, {
        fixture: 'pipeline/api/triggers/triggerMergeCallResponse.json'
      })
      cy.initializeRoute()
      cy.visit(newTriggerRoute, {
        timeout: 30000
      })
      cy.visitPageAssertion()
    })
  })

  it('Tags should be visible in the visual view', () => {
    cy.get('input[name="name"]').clear().type('Test Trigger')
    cy.contains('span', 'Continue').click({ force: true })
    cy.contains('span', 'Continue').click({ force: true })
    cy.get(
      'input[name="pipeline.stages[0].stage.spec.service.serviceInputs.serviceDefinition.spec.artifacts.primary.sources[0].spec.tag"]'
    )
      .clear()
      .type('tag value')
  })
})
