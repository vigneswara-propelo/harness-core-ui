import {
  inputSetListAPIWithoutSort,
  inputSetsTemplateCall,
  pipelineSummaryCallAPI,
  routingDataAPI,
  servicesCallV2,
  servicesV2AccessResponse,
  triggerPipelineDetails,
  triggersAPI,
  triggersRoute
} from '../../support/70-pipeline/constants'
import { getTriggerCatalogAPI } from '../72-triggers/constants'

describe('Triggers for Pipeline', () => {
  const visitTriggersPageWithAssertion = (): void => {
    cy.visit(triggersRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
  }
  beforeEach(() => {
    cy.initializeRoute()

    cy.intercept('GET', routingDataAPI, { fixture: 'ng/api/routingData' }).as('routingData')

    cy.intercept('GET', pipelineSummaryCallAPI, { fixture: '/ng/api/pipelineSummary' }).as('pipelineSummary')
    cy.intercept('GET', triggersAPI, { fixture: 'ng/api/triggers/triggersList.empty.json' }).as('emptyTriggersList')
    cy.intercept('GET', getTriggerCatalogAPI, {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Catalog.json'
    })

    switch (Cypress.currentTest.title) {
      case 'Pipeline Trigger List assertion': {
        cy.intercept('GET', triggersAPI, { fixture: 'ng/api/triggers/triggerList.json' }).as('triggerList')
        visitTriggersPageWithAssertion()
        break
      }
      default: {
        visitTriggersPageWithAssertion()
        break
      }
    }
  })

  it('Cron Trigger Flow', () => {
    const triggerName = 'testTrigger'
    cy.visitPageAssertion()
    cy.wait('@emptyTriggersList')
    cy.contains('span', 'Add New Trigger').should('be.visible').click()
    cy.intercept('POST', inputSetsTemplateCall, { fixture: '/ng/api/triggers/triggerInputSet' }).as('triggerInputSet')

    cy.intercept('GET', triggerPipelineDetails, { fixture: 'ng/api/triggers/triggerPipelineDetails' }).as(
      'triggerPipelineDetails'
    )

    cy.get('.bp3-drawer').within(() => {
      cy.contains('h2', 'Triggers').should('be.visible')
      cy.contains('div', 'Scheduled').scrollIntoView().should('be.visible')
      cy.get('[data-cy="Scheduled_Cron"]').click()
    })

    cy.wait('@triggerPipelineDetails')

    // Overview Tab
    cy.contains('span', 'Trigger Overview').should('be.visible')
    cy.fillField('name', triggerName)
    cy.findByText(triggerName).should('exist')
    cy.get(`[value="${triggerName}"]`).should('be.visible')
    cy.get('span[data-testid="description-edit"]').should('be.visible')
    cy.get('span[data-testid="description-edit"]').click()
    cy.get('span[data-testid="tags-edit"]').should('be.visible')
    cy.get('span[data-testid="tags-edit"]').click()
    cy.fillField('description', 'Test Trigger Description')
    cy.contains('textarea', 'Test Trigger Description').should('be.visible')
    cy.get('input[data-mentions]').clear().type('triggerTag').type('{enter}')
    cy.contains('span', 'triggerTag').should('be.visible')
    cy.get('[aria-label="Continue"]').click()

    // Schedule Tab
    cy.contains('p', 'The Cron expression will be evaluated against UTC time. Current UTC Time:').should('be.visible')
    cy.get("input[name='minutes']").as('minutesInput').click()
    cy.get('.bp3-menu').within(() => {
      cy.findByText('10').click({ force: true })
    })

    cy.intercept('GET', inputSetListAPIWithoutSort, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' })
    cy.intercept('GET', servicesCallV2, servicesV2AccessResponse).as('servicesCallV2')

    cy.get('@minutesInput').should('have.value', '10')
    cy.get('[aria-label="Continue"]').click()

    // Pipeline Input
    cy.wait('@servicesCallV2')
    cy.get('[role="tabpanel"]').within(() => {
      cy.contains('span', 'Pipeline Input').should('be.visible')
      cy.contains('span', 'Select Input Set(s)').click({ force: true })
    })
    cy.get('[class*="popover-content"]')
      .should('be.visible')
      .within(() => {
        cy.findByText('No Input Sets created').should('exist')
      })
    cy.get('input[placeholder*="Select"]').should('be.visible').click({ force: true })
    cy.contains('p', 'testService').click({ force: true })

    // Toggle to YAML view
    cy.get('[data-name="toggle-option-two"]').click({ force: true })
    cy.contains('span', triggerName).should('be.visible')
    cy.contains('span', 'Triggers').should('be.visible')

    // Verify all details in YAML view
    cy.contains('span', 'testTrigger').should('be.visible')
    cy.contains('span', 'Test Trigger Description').should('be.visible')
    cy.contains('span', 'triggerTag').should('be.visible')

    cy.contains('span', 'project1').should('be.visible')
    cy.contains('span', 'testPipeline_Cypress').should('be.visible')

    cy.contains('span', 'Scheduled').should('be.visible')
    cy.contains('span', 'Cron').scrollIntoView().should('be.visible')

    cy.contains('span', 'expression').should('be.visible')
    cy.contains('span', '0/10 * * * *').should('be.visible')

    cy.contains('span', 'testStage_Cypress').should('be.visible')
    cy.contains('span', 'serviceRef').should('be.visible')
    cy.contains('span', 'testService').should('be.visible')

    // Saving trigger
    cy.intercept('POST', triggersAPI).as('saveTrigger')
    cy.contains('span', 'Create Trigger').should('be.visible').click()
    cy.wait('@saveTrigger')
    cy.contains('span', 'Successfully created').should('be.visible')
  })

  it('Pipeline Trigger List assertion', () => {
    cy.wait(1000)
    cy.wait('@triggerList', { timeout: 30000 })
    cy.wait(1000)
    cy.contains('p', 'testTrigger').should('be.visible')

    cy.get('span[data-icon="main-tags"]').should('be.visible')
    cy.get('span[data-icon="main-tags"]').trigger('mouseover')
    cy.contains('p', 'TAGS').should('be.visible')
    cy.contains('span', 'triggerTag').should('be.visible')

    cy.get('span[icon="more"]').should('be.visible').click()
    cy.wait(500)
    cy.contains('div', 'Delete').click()

    cy.contains('span', 'Delete').should('be.visible').click()
    cy.wait(1000)
    cy.contains('span', 'Trigger testTrigger Deleted').should('be.visible')
  })
})
