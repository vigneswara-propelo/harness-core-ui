/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getAWSRegions, getArtifactsAMITags } from '../constansts'
import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'

describe('Amazon Machine Image Artifact Trigger', () => {
  visitTriggersPage()
  describe('Create new trigger', () => {
    const artifactTypeCy = 'Artifact_Amazon Machine Image'
    const connectorId = 'testAWS'
    const triggerName = 'Amazon Machine Image Trigger'
    const region = 'us-east-1'
    const regionLabel = 'US East (N. Virginia)'
    const tags = [
      { name: 'owner', value: '1' },
      { name: 'purpose', value: '2' }
    ]
    const filter = [
      {
        name: 'ami-image-id',
        value: '1'
      },
      { name: 'ami-name', value: '2' }
    ]
    const fillArtifactData = (): void => {
      cy.wait(`@getAWSRegions`)
      cy.get('input[name="region"]').clear().type(regionLabel)
      cy.contains('p', regionLabel).click()
      cy.wait('@getArtifactsAMITags')
      tags.forEach(({ name, value }, index) => {
        cy.contains('span.bp3-button-text', 'AMI Tags').click()
        cy.get(`input[name="tags[${index}].name"]`).clear().type(name)
        cy.contains('p', name).click()
        cy.get(`input[name="tags[${index}].value"]`).clear().type(value)
      })
      filter.forEach(({ name, value }, index) => {
        cy.contains('span.bp3-button-text', 'AMI Filters').click({ force: true })
        cy.get(`input[name="filters[${index}].name"]`).clear().type(name)
        cy.contains('p', name).click()
        cy.get(`input[name="filters[${index}].value"]`).clear().type(value)
      })
    }

    beforeEach(() => {
      cy.intercept('GET', getAWSRegions, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_AWS_Regions.json'
      }).as('getAWSRegions')

      cy.intercept('POST', getArtifactsAMITags({ connectorId, region }), {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Artifacts_AMI_Tags.json'
      }).as('getArtifactsAMITags')
    })

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Amazon_Machine_Image_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AmazonMachineImage\n      spec:\n        connectorRef: testAWS\n        region: us-east-1\n        tags:\n          - name: owner\n            value: "1"\n          - name: purpose\n            value: "2"\n        filters:\n          - name: ami-image-id\n            value: "1"\n          - name: ami-name\n            value: "2"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputYaml: |\n    pipeline:\n      identifier: GCR_Trigger\n      stages:\n        - stage:\n            identifier: S1\n            type: Deployment\n            spec:\n              execution:\n                steps:\n                  - step:\n                      identifier: ShellScript_1\n                      type: ShellScript\n                      timeout: 10m\n`
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${triggerName}\n  identifier: Amazon_Machine_Image_Trigger\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: AmazonMachineImage\n      spec:\n        connectorRef: testAWS\n        region: us-east-1\n        tags:\n          - name: owner\n            value: "1"\n          - name: purpose\n            value: "2"\n        filters:\n          - name: ami-image-id\n            value: "1"\n          - name: ami-name\n            value: "2"\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })
})
