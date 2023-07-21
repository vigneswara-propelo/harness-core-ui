/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

describe('Pipeline Yaml Editor', () => {
  beforeEach(() => {
    cy.login('test', 'test')
    cy.visitCreatePipeline()
    cy.fillName('testPipeline_Cypress')
    cy.clickSubmit()
    cy.createCustomStage()
  })

  it('Copy yaml to clipboard', async () => {
    cy.grantClipboardPermission()

    cy.get('[data-name="toggle-option-two"]').click()
    cy.get('span[data-icon="copy-alt"]').click()
    cy.copyToClipboardAssertion(
      'pipeline:\n  name: testPipeline_Cypress\n  identifier: testPipeline_Cypress\n  projectIdentifier: project1\n  orgIdentifier: default\n  tags: {}\n  stages:\n    - stage:\n        name: testStage_Cypress\n        identifier: testStage_Cypress\n        description: ""\n        type: Custom\n        spec: {}\n        tags: {}\n'
    )
  })
})
