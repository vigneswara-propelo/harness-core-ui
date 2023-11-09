import { featureFlagsCall } from '../../../support/70-pipeline/constants'
import {
  AnalyseDefault,
  AnalyseDefaultSummary,
  stageMetaCall,
  stageMetaResponse
} from '../../../support/85-cv/analyseImpactStep/constants'

describe('Analyse Step', () => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'CVNG_TEMPLATE_VERIFY_STEP',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })
    })
    cy.initializeRoute()
    cy.intercept(
      'GET',
      '/pipeline/api/pipelines/testCypressInit?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&validateAsync=true',
      AnalyseDefault
    )
    cy.intercept(
      'GET',
      '/pipeline/api/pipelines/summary/testCypressInit?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&getMetadataOnly=true',
      AnalyseDefaultSummary
    ).as('pipelineData')

    cy.visit(
      `account/accountId/cd/orgs/default/projects/project1/pipelines/testCypressInit/pipeline-studio/?storeType=INLINE&stageId=Stage_Default&sectionId=EXECUTION`,
      {
        timeout: 30000
      }
    )
    cy.wait('@pipelineData', { timeout: 30000 })
    cy.visitPageAssertion()
  })

  it('Change monitored service type', () => {
    cy.apiMocksForVerifyStep()
    cy.intercept('POST', stageMetaCall, stageMetaResponse).as('stageMeta')

    // stage is visible
    cy.findByText(/Stage Default/i).should('be.visible')

    // open execution tab
    cy.findByText(/AnalyzeDeploymentImpact_1/i).should('be.visible')
    cy.findByText(/AnalyzeDeploymentImpact_1/i).click({ force: true })

    cy.get('input[name="timeout"]').should('have.value', '15m')
    cy.get('input[name="spec.duration"]').should('have.value', '4 days')
    cy.get('input[name="spec.monitoredService.spec.monitoredServiceRef"]').should('have.value', 'orders_prod')

    cy.get('[data-testid="multi-type-button"]').eq(2).click()

    cy.get('a.bp3-menu-item').should('have.length', 3).as('valueList')
    cy.get('@valueList').eq(0).should('contain.text', 'Fixed value').as('fixedValue')
    cy.get('@valueList').eq(1).should('contain.text', 'Runtime input').as('runtimeValue')
    cy.get('@valueList').eq(2).should('contain.text', 'Expression').as('expressionValue')
    cy.get('@runtimeValue').click({ force: true })

    cy.findByText(/Apply Changes/i).click({ force: true })
    cy.wait(1000)
    cy.findByText(/AnalyzeDeploymentImpact_1/i).click({ force: true })
    cy.get('input[name="spec.monitoredService.spec.monitoredServiceRef"]').should('have.value', '<+input>')
  })

  it('Check validations', () => {
    cy.apiMocksForVerifyStep()
    cy.intercept('POST', stageMetaCall, stageMetaResponse).as('stageMeta')

    // stage is visible
    cy.findByText(/Stage Default/i).should('be.visible')

    // open execution tab
    cy.findByText(/Add Step/i).should('be.visible')
    cy.findByText(/Add Step/i).click({ force: true })
    cy.wait(1000)
    cy.findAllByText('Add Step').eq(1).click({ force: true })

    cy.findByText(/Analyze Deployment Impact/i)
      .scrollIntoView()
      .should('be.visible')
    cy.findByText(/Analyze Deployment Impact/i).click({ force: true })

    cy.wait(1000)
    cy.findByText(/Apply Changes/i).click({ force: true })
    cy.findByText(/Duration is required/i).should('be.visible')
    cy.findByText(/Monitored service is required/i).should('be.visible')

    cy.get('input[name="spec.monitoredService.spec.monitoredServiceRef"]').click({ force: true })
    cy.get('.bp3-menu li').eq(0).click({ force: true })
    cy.findByText(/Apply Changes/i).click({ force: true })
    cy.findByText(/At least one health source is required/i).should('be.visible')

    cy.get('input[name="spec.monitoredService.spec.monitoredServiceRef"]').click({ force: true })
    cy.get('.bp3-menu li').eq(2).click({ force: true })
    cy.get('.FormError--errorDiv[data-name="spec.monitoredService.spec.monitoredServiceRef"]').should('not.exist')

    cy.get('input[name="spec.duration"]').click({ force: true })
    cy.get('.bp3-menu li').eq(0).click({ force: true })
    cy.findByText(/Apply Changes/i).click({ force: true })
  })
})
