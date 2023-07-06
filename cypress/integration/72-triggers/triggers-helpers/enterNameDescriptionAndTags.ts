export const enterNameDescriptionAndTags = ({ triggerName, description = '', tags = [] }): void => {
  cy.get('input[name="name"]').should('not.be.disabled')
  cy.get('input[name="name"]').clear().type(triggerName)
  if (description) {
    cy.get('[data-testid="description-edit"]').click()
    cy.get('textarea[name="description"]').clear().type(description)
  }
  cy.get('[data-testid="tags-edit"]').click()
  tags.forEach(tag => {
    cy.get('input[data-mentions="kv-tag-input-tags"]').clear().type(tag).type('{enter}')
  })
}
