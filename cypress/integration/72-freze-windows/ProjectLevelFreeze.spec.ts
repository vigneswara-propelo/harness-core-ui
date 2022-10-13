import { newProjectLevelFreezeRoute, featureFlagsCall } from './constants'

describe('Project Level Freeze Creation', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      return false
    })

    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'NG_DEPLOYMENT_FREEZE',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      })

      cy.initializeRoute()
      //
    })
  })

  it('should go to freeze creation page in Project Level and init config', () => {
    cy.visit(newProjectLevelFreezeRoute, { timeout: 30000 })
    cy.visitPageAssertion('.PillToggle--item')
    cy.get('.bp3-dialog input[name="name"]')
      .should('be.visible')
      .type('project level freeze')
      .should('have.value', 'project level freeze')
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.get('button[type="submit"]').click()
    })

    // Check if Header has required nodes
    cy.get('.Toggle--toggle input').should('be.checked')
    cy.get('.PillToggle--optionBtns').should('have.length', 1)
    cy.get('.PillToggle--item').should('have.length', 2)
  })
  it('should add a rule in Config Section', () => {
    cy.visit(newProjectLevelFreezeRoute, { timeout: 30000 })
    cy.visitPageAssertion('.PillToggle--item')
    cy.get('.bp3-dialog input[name="name"]')
      .should('be.visible')
      .type('project level freeze')
      .should('have.value', 'project level freeze')
    cy.get('[class*=bp3-dialog]').within(() => {
      cy.get('button[type="submit"]').click()
    })

    // Click on Freeze Config Tab
    cy.get('#bp3-tab-title_freezeWindowStudio_FREEZE_CONFIG').should('be.visible').click()
    cy.get('h4').contains('Define which resources you want to include in this freeze window')

    // Click on Add rule
    cy.get('button span[icon="plus"]').click()
    cy.wait(500)

    // Formik - Rules section
    cy.get('.OverlaySpinner--overlaySpinner .FormikForm--main').should('have.length', 1)
  })
})
