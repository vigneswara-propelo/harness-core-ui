import {
  pipelineExecutionAPI,
  pipelineExecutionForNodeAPI,
  pipelineExecutionSummaryAPI,
  pipelineListAPI
} from '../../../support/70-pipeline/constants'
import { featureFlagsCall } from '../../../support/85-cv/common'

import {
  abortVerificationCall,
  aggregateProjectsCall,
  deploymentTimeseriesDataAPI,
  deploymentTimeseriesDataWithFilters,
  deploymentTimeseriesDataWithNodeFilterAPI,
  feedbackHistory,
  feedbackHistoryResponse,
  gitSyncCall,
  healthSourceAPI,
  healthSourceMetricsAPI,
  healthSourcesResponseWithLogs,
  logsListCall,
  logsListCallResponse,
  logsListCLusterFilterCall,
  logsListMinSliderFilterCall,
  logsListNodeFilterCall,
  logsRadarChartDataCall,
  logsRadarChartDataCallResponse,
  logsRadarChartDataCLusterFilterCall,
  logsRadarChartDataNodeFilterCall,
  nodeNamesFilterAPI,
  overviewCall,
  overviewCallRunningPipelineResponse,
  overviewCallAbortedPipelineResponse,
  pipelinesFetchCall,
  pipelinesSummaryFetchCall,
  pipelinesYamlFetchCall,
  sourceCodeManagerCall,
  transactionsFilterAPI
} from '../../../support/85-cv/verifyStep/constants'

describe('Verify step', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      // 🚨 TODO: Update respective feature flag for Abort verification
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'SRM_LOG_FEEDBACK_ENABLE_UI',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })

    cy.intercept('POST', pipelineListAPI, { fixture: '/pipeline/api/pipelines/getPipelineList' }).as('pipelineList')
    cy.intercept('GET', pipelinesSummaryFetchCall, { fixture: '/pipeline/api/pipelines/pipelineSummary' }).as(
      'pipelineSummary'
    )
    cy.intercept('GET', pipelinesFetchCall, { fixture: '/pipeline/api/pipelines/getPipelineDetails' }).as(
      'pipelineDetails'
    )
    cy.intercept('POST', pipelineExecutionSummaryAPI, {
      fixture: '/pipeline/api/pipelines/getExecutionSummary'
    }).as('pipelineExecutionSumary')
    cy.intercept('GET', pipelineExecutionAPI, { fixture: '/pipeline/api/pipelines/getExecutionDetails' }).as(
      'pipelineExecution'
    )
    cy.intercept('GET', pipelineExecutionForNodeAPI, { fixture: '/pipeline/api/pipelines/getNodeExecutionDetails' }).as(
      'pipelineExecutionForNode'
    )

    cy.intercept('GET', deploymentTimeseriesDataAPI, { fixture: '/cv/verifyStep/getDeploymentTimeseriesData' }).as(
      'deploymentTimeseriesData'
    )
    cy.intercept('GET', healthSourceAPI, { fixture: '/cv/verifyStep/getHealthSourceFilters' }).as('healthSource')
    cy.intercept('GET', nodeNamesFilterAPI, { fixture: '/cv/verifyStep/getNodeNameFilters' }).as('nodeNames')
    cy.intercept('GET', transactionsFilterAPI, { fixture: '/cv/verifyStep/getTransactionNameFilters' }).as(
      'transactions'
    )

    cy.intercept('GET', deploymentTimeseriesDataWithNodeFilterAPI, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithNodeFilter')

    cy.intercept('GET', deploymentTimeseriesDataWithFilters, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithFilters')

    cy.intercept('GET', gitSyncCall, {}).as('gitSyncCall')
    cy.intercept('GET', pipelinesYamlFetchCall, {}).as('pipelinesYamlFetchCall')
    cy.intercept('GET', sourceCodeManagerCall, {}).as('sourceCodeManagerCall')
    cy.intercept('GET', aggregateProjectsCall).as('aggregateProjectsCall')

    cy.login('test', 'test')
    cy.visitPageAssertion('[class^=SideNav-module_main]')
    cy.contains('p', 'Projects').click()
    cy.contains('p', 'Project 1').click()
    cy.contains('p', 'Deployments').click()
    cy.contains('p', 'Pipelines').click()

    cy.wait('@pipelineList')
    cy.wait('@aggregateProjectsCall')
  })

  it('should test abort verification', () => {
    cy.intercept('GET', logsListCall, logsListCallResponse).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', overviewCall, overviewCallRunningPipelineResponse).as('overviewCall')
    cy.intercept('POST', abortVerificationCall).as('abortVerificationCall')

    cy.intercept('GET', healthSourceMetricsAPI, healthSourcesResponseWithLogs).as('healthSource')

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')
    cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    // 🚨 Add feature flag

    cy.findByTestId(/abortVerificationButton/)
      .should('exist')
      .scrollIntoView()
      .click()

    cy.findByText(/Mark as Success/)
      .scrollIntoView()
      .should('exist')
    cy.findByText(/Mark as Failure/)
      .scrollIntoView()
      .should('exist')

    cy.findByText(/Mark as Success/)
      .scrollIntoView()
      .click({ force: true })

    cy.findByTestId(/abortVerificationConfirmButton/).should('be.visible')

    cy.findByTestId(/abortVerificationConfirmButton/).click()

    cy.wait('@abortVerificationCall')
  })
  it('should show info banner if the execution was previously aborted', () => {
    cy.intercept('GET', logsListCall, logsListCallResponse).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', overviewCall, overviewCallAbortedPipelineResponse).as('overviewCall')
    cy.intercept('POST', abortVerificationCall).as('abortVerificationCall')

    cy.intercept('GET', healthSourceMetricsAPI, healthSourcesResponseWithLogs).as('healthSource')

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')
    cy.intercept('GET', feedbackHistory, feedbackHistoryResponse).as('feedbackHistory')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    // 🚨 Add feature flag

    cy.get('button[data-testid="abortVerificationButton"] span[icon="chevron-down"]').should('not.exist')

    cy.findByText(/Verification has been manually aborted and marked as failed./).should('exist')
  })
})
