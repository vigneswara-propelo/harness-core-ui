import {
  servicesRoute,
  servicesDetailV2,
  servicesUpsertCall,
  pageHeaderClassName
} from '../../support/70-pipeline/constants'

describe('Services for Pipeline', () => {
  beforeEach(() => {
    cy.initializeRoute()
    cy.visit(servicesRoute, {
      timeout: 30000
    })
  })

  it('Service Addition & YAML/visual parity', () => {
    cy.intercept('GET', servicesDetailV2, { fixture: 'ng/api/servicesV2/servicesDetailV2.empty.json' }).as(
      'emptyServicesList'
    )
    cy.wait(1000)
    cy.visitPageAssertion(pageHeaderClassName)
    cy.wait('@emptyServicesList')
    cy.wait(500)
    cy.contains('span', 'New Service').should('be.visible')
    cy.contains('span', 'New Service').click()
    cy.matchImageSnapshot('New Service Modal')

    cy.fillName('testService')
    cy.get('span[data-testid="description-edit"]').should('be.visible')
    cy.get('span[data-testid="description-edit"]').click()
    cy.get('span[data-testid="tags-edit"]').should('be.visible')
    cy.get('span[data-testid="tags-edit"]').click()

    cy.fillField('description', 'Test Service Description')
    cy.contains('textarea', 'Test Service Description').should('be.visible')
    cy.get('input[data-mentions]').clear().type('serviceTag').type('{enter}')
    cy.contains('span', 'serviceTag').should('be.visible')

    // // Saving
    cy.contains('span', 'Save').click()
    cy.wait(1000)
    cy.contains('span', 'Service created successfully').should('be.visible')
  })

  it('Services Assertion and Edit', () => {
    cy.intercept('GET', servicesDetailV2, { fixture: 'ng/api/servicesV2/servicesDetailV2.json' }).as('servicesList')
    cy.wait(1000)
    cy.visitPageAssertion(pageHeaderClassName)
    cy.wait('@servicesList')
    cy.wait(500)

    cy.contains('p', 'testService').should('be.visible')

    cy.get('span[data-icon="main-tags"]').should('be.visible')
    cy.get('span[data-icon="main-tags"]').trigger('mouseover')
    cy.contains('p', 'TAGS').should('be.visible')
    cy.contains('span', 'serviceTag').should('be.visible')
    cy.get('span[data-icon="main-tags"]').trigger('mouseout').wait(500)

    cy.get('span[data-icon="Options"]').should('be.visible')
    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Edit').should('be.visible').click({ force: true })
  })

  it('Services Assertion and Deletion', () => {
    cy.intercept('GET', servicesDetailV2, { fixture: 'ng/api/servicesV2/servicesDetailV2.json' }).as('servicesList')
    cy.wait(1000)
    cy.visitPageAssertion(pageHeaderClassName)
    cy.wait('@servicesList')
    cy.wait(500)

    cy.contains('p', 'testService').should('be.visible')

    cy.get('span[data-icon="main-tags"]').should('be.visible')
    cy.get('span[data-icon="main-tags"]').trigger('mouseover')
    cy.contains('p', 'TAGS').should('be.visible')
    cy.contains('span', 'serviceTag').should('be.visible')
    cy.get('span[data-icon="main-tags"]').trigger('mouseout').wait(500)

    cy.get('span[data-icon="Options"]').should('be.visible')
    cy.get('span[data-icon="Options"]').click()
    cy.contains('div', 'Delete').should('be.visible').click({ force: true })

    cy.contains('span', 'Confirm').should('be.visible')
    cy.contains('span', 'Confirm').click()
    cy.wait(1000)
    cy.contains('span', 'Service deleted').should('be.visible')
  })
})
