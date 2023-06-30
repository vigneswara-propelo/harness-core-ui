/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { visitTriggersPage } from '../triggers-helpers/visitTriggersPage'
import { fillArtifactTriggerData } from './artifact-trigger-helpers/fillArtifactTriggerData'
import { getGCRArtifactData } from './ArtifactTriggerConfig'
import { editArtifactTriggerHelper } from './artifact-trigger-helpers/editArtifactTriggerHelper'
import { visitArtifactTriggerPage } from './artifact-trigger-helpers/visitArtifactTriggerPage'

describe('GCR Artifact Trigger', () => {
  const { identifier, connectorId, registryHostname, imagePath, yaml } = getGCRArtifactData()
  describe('Create new trigger', () => {
    visitTriggersPage()
    const artifactTypeCy = 'Artifact_GCR'

    const fillArtifactData = (): void => {
      cy.get('input[name="registryHostname"]').clear().type(registryHostname)
      cy.contains('p', registryHostname).click()
      cy.get('input[name="imagePath"]').clear().type(imagePath)
    }

    it('1: Pipeline Input', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName: identifier,
        connectorId,
        fillArtifactData,
        triggerYAML: yaml
      })
    })
    it('2: InputSetRefs', () => {
      fillArtifactTriggerData({
        artifactTypeCy,
        triggerName: identifier,
        connectorId,
        fillArtifactData,
        inputSetRefs: ['inputset1', 'inputset2'],
        triggerYAML: `trigger:\n  name: ${identifier}\n  identifier: ${identifier}\n  enabled: true\n  description: test description\n  tags:\n    tag1: ""\n    tag2: ""\n  orgIdentifier: default\n  projectIdentifier: project1\n  pipelineIdentifier: testPipeline_Cypress\n  stagesToExecute: []\n  source:\n    type: Artifact\n    spec:\n      type: Gcr\n      spec:\n        connectorRef: ${connectorId}\n        eventConditions:\n          - key: build\n            operator: Equals\n            value: "1"\n        imagePath: ${imagePath}\n        registryHostname: ${registryHostname}\n        tag: <+trigger.artifact.build>\n        metaDataConditions:\n          - key: <+trigger.artifact.metadata.field>\n            operator: Equals\n            value: "1"\n        jexlCondition: <+trigger.payload.repository.owner.name> == "harness"\n  inputSetRefs:\n    - inputset1\n    - inputset2\n`
      })
    })
  })

  describe('2: Edit trigger', () => {
    const checkArtifactData = (): void => {
      cy.get('input[name="registryHostname"]').should('have.value', registryHostname)
      cy.get('input[name="imagePath"]').should('have.value', imagePath)
    }

    visitArtifactTriggerPage({ identifier, yaml })

    it('2.1: Pipeline Input', () => {
      editArtifactTriggerHelper({ connectorId, checkArtifactData, yaml })
    })
  })
})
