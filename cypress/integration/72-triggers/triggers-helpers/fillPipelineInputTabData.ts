import { createTriggerAPIV2, getPipelineInputSets } from '../constansts'

export const fillPipelineInputTabDataAndSubmitForm = ({ inputSetRefs = [], timeout = '10m', triggerYAML }): void => {
  // Move to Pipeline Input Tab
  cy.contains('span', 'Continue').click()

  if (inputSetRefs.length) {
    cy.intercept('GET', getPipelineInputSets({ pipeline: 'testPipeline_Cypress' }), {
      fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_InputSets.json'
    }).as('getPipelineInputSets')
    cy.wait('@getPipelineInputSets')
  }

  // Pipeline Input Tab
  if (inputSetRefs.length) {
    cy.contains('span', 'Select Input Set(s)').click()
    inputSetRefs.forEach(inputSetRef => {
      cy.contains('p', `Id: ${inputSetRef}`).click({ force: true })
    })
    cy.contains('span', 'Apply Input Set').click({ force: true })
  } else {
    cy.get('input[name="pipeline.stages[0].stage.spec.execution.steps[0].step.timeout"]').clear().type(timeout)
  }

  cy.intercept('POST', createTriggerAPIV2).as('createTriggerAPIV2')
  cy.get('button[type="submit"]').click()

  // Create API Call
  cy.wait('@createTriggerAPIV2').its('request.body').should('eq', triggerYAML)
}
