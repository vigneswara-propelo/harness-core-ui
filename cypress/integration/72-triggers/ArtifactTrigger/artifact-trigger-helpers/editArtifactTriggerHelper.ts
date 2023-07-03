import { parse } from 'yaml'
import { awsConnectorCall } from '../../constants'

export const editArtifactTriggerHelper = ({
  connectorId,
  checkArtifactData,
  yaml
}: {
  connectorId?: string
  checkArtifactData: () => void
  yaml: string
}): void => {
  cy.intercept('GET', awsConnectorCall, { fixture: 'pipeline/api/triggers/awsConnectorResponse.json' }).as(
    'awsConnectorCall'
  )

  //Click on artifact source edit button
  cy.get('span[data-icon="Edit"]').click()

  if (connectorId) {
    cy.wait('@awsConnectorCall')
  }

  cy.get('.StepWizard--stepDetails').within(() => {
    // Check for artifact source connector
    if (connectorId) {
      cy.contains('p', connectorId).should('be.visible')
      cy.contains('span', 'Continue').click()
    }

    checkArtifactData()

    // Submit artifact source form
    cy.get('button[type="submit"]').click()
  })

  //   Move to Conditions tab
  cy.contains('span', 'Continue').click()

  // Move to Pipeline Input tab
  cy.contains('span', 'Continue').click()

  // Update Trigger
  cy.get('button[type="submit"]').click()

  cy.wait('@updateTriggerAPI').then(xhr => {
    expect(Cypress._.isMatch(parse(xhr.request.body), parse(yaml))).to.be.true
  })
}
