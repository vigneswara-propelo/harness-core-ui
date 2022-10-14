import { featureFlagsCall, overviewPage, orgOverviewPage, getOrgCall } from './constants'

describe('check if Route is available if FF is enabled', () => {
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
    })

    cy.intercept('GET', getOrgCall, { fixture: 'pipeline/api/organization/getOrganization' }).as('getOrgCall')
    cy.initializeRoute()
  })

  it('should find FreezeWindows at Account level, and should redirect to Freeze List Page', () => {
    cy.visit(overviewPage, { timeout: 30000 })
    cy.visitPageAssertion('.PageHeader--container')
    cy.get('div a p').contains('Freeze Windows').as('freezeWindowsLink')
    cy.get('@freezeWindowsLink').click()
    cy.wait(500)
    cy.location().should(loc => {
      expect(loc.hash).to.eq('#/account/accountId/settings/freeze-windows')
    })
  })

  it('should find FreezeWindows at Organization level, and should redirect to Freeze List Page', () => {
    cy.visit(orgOverviewPage, { timeout: 30000 })
    cy.visitPageAssertion('.PageHeader--container')
    cy.get('div h1').contains('Organization Level Governance')
    cy.get('div div.bp3-card p span').contains('Freeze Windows').as('freezeWindowsLink')
    cy.get('@freezeWindowsLink').click()
    cy.wait(500)
    cy.location().should(loc => {
      expect(loc.hash).to.eq('#/account/accountId/settings/organizations/default/setup/freeze-windows')
    })
  })
})
