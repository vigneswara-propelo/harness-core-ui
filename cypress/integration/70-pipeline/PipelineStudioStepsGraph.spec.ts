import {
  gitSyncEnabledCall,
  pipelineSaveCall,
  stepLibrary,
  inputSetsTemplateCall,
  pipelineDetails,
  applyTemplatesCall,
  inputSetsCall,
  pipelineStudioRoute,
  dragElementVerticallyBy,
  featureFlagsCall,
  pipelineVariablesCall,
  saveStepAsTemplateCall,
  selectedTemplateCall,
  shellScriptProvisionerYamlSnippetsCall,
  templateInputsCall,
  templateMetadataCallAfterSelection,
  templateMetadataUpdatedCall,
  templateValueCall
} from '../../support/70-pipeline/constants'
import { templateListCallAfterSelectionResponse } from '../../support/72-templates-library/constants'

// TODO:: replace with FF or enablement of feature done as part of https://github.com/harness/harness-core-ui/pull/16916
const IS_NODE_TOGGLE_DISABLED = false

const visitExecutionStageWithAssertion = (): void => {
  cy.visit(pipelineStudioRoute, {
    timeout: 30000
  })
  cy.visitPageAssertion()
  cy.wait('@pipelineDetails', { timeout: 30000 })
}

const visitStepsGraph = (): void => {
  visitExecutionStageWithAssertion()

  cy.get(`div[data-testid="pipeline-studio"]`, {
    timeout: 5000
  }).should('be.visible')
  cy.contains('p', 'testStage_Cypress').click({ force: true })
}

const applyChanges = (): void => {
  // Explicit wait added to let async update of pipeline and render of graph to be accomodated
  cy.wait(500)
  cy.contains('span', 'Apply Changes').should('be.visible').click()
  cy.wait(300)
}

const toggleAndVerifyStepOrGroupNode = (numSteps: number, numStepGroups: number, isRollback = false): void => {
  const toggleAndVerifyNode = (index: number, isStepGroup = false): void => {
    const nodeType = isStepGroup ? 'stepGroup' : 'step'

    cy.get(`div[data-testid="toggle-${nodeType}-node"]`).eq(index).click({ force: true })
    cy.get(`div[data-testid="toggle-${nodeType}-node"]`)
      .eq(index)
      .find('input[type="checkbox"]')
      .should('not.be.checked')

    // For simpler verification, letting all rollback steps to have when condition and disabled
    if (!isRollback) {
      cy.get(`div[data-testid="toggle-${nodeType}-node"]`).eq(index).click({ force: true })
      cy.get(`div[data-testid="toggle-${nodeType}-node"]`).eq(index).find('input[type="checkbox"]').should('be.checked')
    }
  }

  for (let i = 0; i < numSteps; i++) {
    toggleAndVerifyNode(i)
  }

  for (let i = 0; i < numStepGroups; i++) {
    toggleAndVerifyNode(i, true)
  }
}

const addStepFromDrawer = (name: string): void => {
  cy.wait(500)
  cy.get(`[data-testid="step-card-${name}"]`).scrollIntoView().should('be.visible').click()
}

const updateStepGroupName = (numOfStepGroup: number, prefix = ''): void => {
  for (let i = 0; i < numOfStepGroup; i++) {
    const stepGroupName = `Step_Group_Node_${i}`
    cy.get('[data-test-id="step-group-name"]').eq(i).should('be.visible').click({ force: true })
    cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType(stepGroupName, prefix)
    applyChanges()
    cy.contains('p', stepGroupName).should('be.visible')
    cy.wait(200)
  }
}

const updateStepsToTemplateNodes = (prefix = ''): void => {
  cy.get('.default-node').each(($node, index) => {
    const stepName = `Template_Step_Node_${index}`
    // Exclude stage node and first template node
    if (index > 1) {
      cy.wrap($node).click({ force: true })
      cy.get('[class*="step-tabs"]').within(() => {
        cy.contains('span', 'Save as Template').should('be.visible').click()
      })

      // Enter stepName in template popover
      cy.get('[class*="gitFormWrapper"]')
        .should('be.visible')
        .within(() => {
          cy.get('input[name="name"]').should('be.visible').clear().type('Cypress_Step_Template')
          cy.get('input[name="versionLabel"]').should('be.visible').clear().type('1')
        })

      cy.get('[class*="basicDetails"]').within(() => {
        cy.contains('span', 'Save').click()
      })

      cy.wait('@stepSavedAsTemplate')
      cy.wait(200)
      cy.get('.bp3-dialog').within(() => {
        cy.findByRole('button', { name: /Yes/i }).click()
      })
      cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType(stepName, prefix)
      cy.wait(500)
      cy.contains('span', 'Apply Changes').click()
    }
  })
}

const collapseSideNavAndZoomOut = (): void => {
  // Collapse sideNav and zoom out graph for steps selectio
  cy.get('[class*="sideNavResizeBtn"]').click({ force: true })
  cy.get('*[class^="ExecutionGraph-module_canvas"]')
    .should('be.visible')
    .within(() => {
      for (let n = 0; n < 4; n++) {
        cy.get('span[data-icon="zoom-out"]').click({ force: true })
      }
    })
}

const assertNodeVisible = (name: string): void => {
  cy.wait(300)
  cy.contains('p', name).should('be.visible')
  cy.wait(300)
}

const getName = (name: string, prefix = ''): string => {
  return `${prefix}${name}`
}

const switchExecutionRollback = (switchToRollback?: boolean): void => {
  cy.get('[class*="rollback-toggle"]').within(() => {
    cy.contains('p', switchToRollback ? 'Rollback' : 'Execution').click({ force: true })
  })
}

beforeEach(() => {
  cy.initializeRoute()
  cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
  cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
    cy.intercept('GET', featureFlagsCall, {
      ...featureFlagsData,
      resource: [
        ...featureFlagsData.resource,
        {
          uuid: null,
          name: 'CD_NG_DYNAMIC_PROVISIONING_ENV_V2',
          enabled: true,
          lastUpdatedAt: 0
        },
        {
          uuid: null,
          name: 'NG_SVC_ENV_REDESIGN',
          enabled: true,
          lastUpdatedAt: 0
        }
      ]
    }).as('enableFeatureFlag')
  })
  cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
  cy.intercept('POST', stepLibrary, { fixture: 'ng/api/stepNg/cdStepLibrary' }).as('stepLibrary')
  cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.postsuccess' })
  // Input Set APIs
  cy.intercept('POST', inputSetsTemplateCall, { fixture: 'pipeline/api/inputSet/inputSetsTemplateCall' }).as(
    'inputSetsTemplateCall'
  )
  cy.intercept('POST', applyTemplatesCall, { fixture: 'pipeline/api/inputSet/applyTemplatesCall' })
  cy.intercept('GET', inputSetsCall, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' }).as('emptyInputSetList')

  cy.intercept('POST', templateMetadataUpdatedCall, { fixture: 'template/api/stepTemplateList' }).as('templateList')

  cy.intercept('GET', templateValueCall, { fixture: 'template/api/stepTemplateValue' }).as('stepTemplateValue')
  cy.intercept('GET', selectedTemplateCall, { fixture: 'template/api/stepTemplateValue' }).as('stepTemplateValue')
  cy.intercept('GET', templateInputsCall, { fixture: 'template/api/templateInputs' }).as('templateInputs')
  cy.intercept('POST', templateMetadataCallAfterSelection, templateListCallAfterSelectionResponse).as(
    'templateListCallAfterSelection'
  )
  cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/runpipeline/pipelines.variables' }).as(
    'piplelineVariables'
  )

  cy.intercept('POST', saveStepAsTemplateCall, { fixture: 'template/api/stepSavedAsTemplate' }).as(
    'stepSavedAsTemplate'
  )
  cy.intercept('GET', shellScriptProvisionerYamlSnippetsCall, {
    fixture: 'ng/api/shellScriptProvisionerYamlSnippets'
  }).as('shellScriptProvisionerYamlSnippets')
})

const duplicateIdentifiersScenarios = ({ prefix = '', isProvisioner = false, disableStepGroup = false }): void => {
  // Add series step in steps graph
  cy.contains('p', 'Add Step').click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  applyChanges()
  assertNodeVisible(getName('Node_1', prefix))
  isProvisioner && cy.get('div[id="ref_Dummy_Step"]').then(el => dragElementVerticallyBy(el, -20))
  // Add series step via create-node ( same name should throw error duplicate step), update name and save
  cy.contains('p', 'Add Step').click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  cy.wait(300)
  cy.contains('span', 'Apply Changes').click()
  cy.contains('span', 'Duplicate Step')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_2', prefix)
  applyChanges()
  assertNodeVisible(getName('Node_2', prefix))

  // Add parallel step via create-node ( same name should throw error duplicate step), update name and save
  cy.contains('p', getName('Node_1', prefix)).parent().next().as('siblingElement')
  cy.get('@siblingElement').closest('div[data-testid="create-node-step"]').click({ force: true })

  // siblings().get('div[data-testid="create-node-step"]').click()
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  cy.wait(300)
  cy.contains('span', 'Apply Changes').click()
  cy.contains('span', 'Duplicate Step')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_3', prefix)
  applyChanges()
  assertNodeVisible(getName('Node_3', prefix))

  if (disableStepGroup) return
  // Add series stepGroup in steps graph
  cy.contains('p', 'Add Step').click({ force: true })
  cy.findByTestId('addStepGroup').click()
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  applyChanges()
  cy.get('[class*="stepGroupHeader"]')
    .eq(0)
    .should('be.visible')
    .within(() => {
      assertNodeVisible(getName('Node_1', prefix))
    })
  // Add siblings ( series/parallel) stepGroup in steps ( same name should throw error duplicate step)
  cy.contains('p', 'Add Step').click({ force: true })
  cy.findByTestId('addStepGroup').click()
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  cy.wait(300)
  cy.contains('span', 'Apply Changes').click()
  cy.contains('span', 'Duplicate Step')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_2', prefix)
  applyChanges()
  cy.get('[class*="stepGroupHeader"]')
    .eq(1)
    .within(() => {
      assertNodeVisible(getName('Node_2', prefix))
    })
  // Add same identifier icon step inside first StepGroup
  cy.get('[class*="stepGroupBody"]')
    .eq(0)
    .within(() => {
      cy.wait(300)
      cy.get('div[data-testid="create-node-step"]').click({ force: true })
    })

  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Barrier')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  // Barrier reference as runtime
  cy.get('[id*="bp3-tab-panel_step-commands_StepConfiguration"]').within(() => {
    cy.get('.MultiTypeInput--btn').eq(1).click()
  })
  cy.contains('span', 'Runtime input').click()

  applyChanges()
  cy.wait(300)
  cy.get('[class*="stepGroupBody"]')
    .eq(0)
    .should('be.visible')
    .within(() => {
      assertNodeVisible(getName('Node_1', prefix))
    })

  // Add same identifier icon step inside first StepGroup
  cy.get('[class*="stepGroupBody"]')
    .eq(1)
    .within(() => {
      cy.wait(300)
      cy.get('div[data-testid="create-node-step"]').click({ force: true })
    })

  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Harness Approval')
  cy.wait(500)
  cy.contains('span', 'Apply Changes').should('be.visible').click()
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_2', prefix)
  // Approver user group is runtime
  cy.get('label[for="spec.approvers.userGroups"]').within(() => {
    cy.get('[class*="MultiTypeSelectorButton"]').eq(0).click()
  })
  cy.contains('span', 'Runtime input').click()

  applyChanges()
  cy.get('[class*="stepGroupBody"]')
    .eq(1)
    .should('be.visible')
    .within(() => {
      assertNodeVisible(getName('Node_2', prefix))
    })
  // Add nested steps/stepGroup inside StepGroup ( all with same name )
  cy.get('[class*="stepGroupBody"]')
    .eq(0)
    .should('be.visible')
    .within(() => {
      cy.wait(300)
      // Add siblings stepGroup to existing node as nested stepGroup
      cy.contains('p', 'Node_1').parent().next().as('siblingElement')
      cy.get('@siblingElement').closest('div[data-testid="create-node-step"]').click({ force: true })
    })

  cy.findByTestId('addStepGroup').click()
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  applyChanges()
  cy.get('[class*="stepGroupHeader"]')
    .eq(1)
    .should('be.visible')
    .within(() => {
      assertNodeVisible(getName('Node_1', prefix))
    })
  // Add step inside nested StepGroup
  cy.get('[class*="stepGroupBody"]')
    .eq(1)
    .should('be.visible')
    .within(() => {
      cy.wait(300)
      cy.get('div[data-testid="create-node-step"]').click({ force: true })
    })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  cy.wait(500)
  cy.contains('span', 'Apply Changes').click()

  // Add parallel stepGroup with same name - duplicate error + nested step with same name
  cy.get('.stepAddIcon')
  cy.get('.stepAddIcon').eq(13).click({ force: true })
  cy.findByTestId('addStepGroup').click()
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  cy.wait(300)
  cy.contains('span', 'Apply Changes').click()
  cy.contains('span', 'Duplicate Step')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_2', prefix)
  cy.wait(300)
  cy.contains('span', 'Apply Changes').should('be.visible').click()
  cy.contains('span', 'Duplicate Step')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_3', prefix)
  applyChanges()
  assertNodeVisible(getName('Node_3', prefix))
  cy.get('[class*="stepGroupBody"]')
    .eq(2)
    .within(() => {
      cy.wait(300)
      cy.get('div[data-testid="create-node-step"]').click({ force: true })
    })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Node_1', prefix)
  cy.wait(500)
  cy.contains('span', 'Apply Changes').click()
}

const nodesAdditionLinkNode = (prefix = ''): void => {
  // Add step via link node(+)
  cy.get('[class*="addNodeIcon"]').eq(1).click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Step_1', prefix)
  applyChanges()
  assertNodeVisible(getName('Step_1', prefix))

  // Add stepGroup via link node(+)
  cy.get('[class*="addNodeIcon"]').eq(2).click({ force: true })
  cy.findByTestId('addStepGroup').click()
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('StepGroup_1', prefix)
  applyChanges()
  assertNodeVisible(getName('StepGroup_1', prefix))

  // Add step to left of stepGroup via link node (+)
  cy.get('[class*="addNodeIcon"]').eq(2).click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Step_2', prefix)
  applyChanges()
  assertNodeVisible(getName('Step_2', prefix))

  // Add step inside stepGroup via create node
  cy.get('.stepAddIcon').eq(4).click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Step_4', prefix)
  applyChanges()
  assertNodeVisible(getName('Step_4', prefix))

  // Add step inside stepGroup step left addNodeIcon
  cy.get('[class*="addNodeIcon"]').eq(3).click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Step_3', prefix)
  applyChanges()
  assertNodeVisible(getName('Step_3', prefix))

  // Add step inside stepGroup step right addNodeIcon
  cy.get('[class*="addNodeIcon"]').eq(5).click({ force: true })
  cy.findByTestId('addStepPipeline').click()
  cy.wait('@stepLibrary')
  addStepFromDrawer('Dry Run')
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Step_5', prefix)
  applyChanges()
  assertNodeVisible(getName('Step_5', prefix))
}

const addDynamicProvisionerStep = (): void => {
  cy.contains('span', 'Environment').click()
  cy.contains('span', 'Provision your target infrastructure dynamically during the execution of your Pipeline')
    .should('be.visible')
    .click({ force: true })
  cy.get('.bp3-dialog-container').within(() => {
    cy.get(`div[data-testid="provisioner-Script"]`).should('be.visible').click()
    cy.findByRole('button', { name: /Set Up Provisioner/i }).click()
  })

  cy.wait('@shellScriptProvisionerYamlSnippets')
  cy.wait('@piplelineVariables')
  cy.contains('p', 'Shell Script Provision').should('be.visible').click({ force: true })
  cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Dummy_Step')
  cy.get('label[for="spec.source.spec.script"]').within(() => {
    cy.get('[class*="MultiTypeSelectorButton"]').eq(0).click()
  })
  cy.contains('span', 'Runtime input').click()
  cy.wait(300)
  cy.contains('span', 'Apply Changes').click()

  // Execution steps
  for (let n = 0; n < 7; n++) {
    cy.get('span[data-icon="zoom-out"]').eq(1).click({ force: true })
  }
  cy.contains(
    'span',
    'Provision your target infrastructure dynamically during the execution of your Pipeline'
  ).scrollIntoView()
}

describe('Execution Stages', () => {
  it(`CD Stage Infrastructure Dynamic Provisioning Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sWithExecutionRollback'
    }).as('pipelineDetails')

    visitStepsGraph()
    addDynamicProvisionerStep()

    duplicateIdentifiersScenarios({ isProvisioner: true, prefix: 'Prov_' })
    updateStepGroupName(4, 'Prov_')
  })

  it(`CD Stage Infrastructure Dynamic Provisioning Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sWithExecutionRollback'
    }).as('pipelineDetails')

    visitStepsGraph()
    addDynamicProvisionerStep()
    nodesAdditionLinkNode('Prov_')
  })

  it(`CD Stage Infrastructure Dynamic Provisioning Execution Steps Toggle`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sWithExecutionRollback'
    }).as('pipelineDetails')

    visitStepsGraph()
    addDynamicProvisionerStep()

    nodesAdditionLinkNode('Prov_')
    // Verify toggle on steps and disable to check
    IS_NODE_TOGGLE_DISABLED && toggleAndVerifyStepOrGroupNode(11, 5)
  })

  it(`CD Stage Infrastructure Dynamic Provisioning Rollback Steps`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sProvisionExecution'
    }).as('pipelineDetails')

    visitStepsGraph()
    cy.contains('span', 'Environment').click()
    cy.wait('@piplelineVariables')
    cy.contains(
      'span',
      'Provision your target infrastructure dynamically during the execution of your Pipeline'
    ).scrollIntoView()
    // Switch to Rollback Steps and assert studio assertions
    switchExecutionRollback(true)
    for (let n = 0; n < 4; n++) {
      cy.get('span[data-icon="zoom-out"]').eq(1).click({ force: true })
    }

    cy.contains('p', 'Add Step').click({ force: true })
    cy.findByTestId('addStepPipeline').click()
    cy.wait('@stepLibrary')
    addStepFromDrawer('Dry Run')
    cy.wait(300)
    cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Dummy_Step')
    applyChanges()

    nodesAdditionLinkNode('Prov_')

    // Edit/Update steps on selection and drawer closing
    cy.get('.default-node').each(($node, index) => {
      // Exclude stage node
      if (index > 0) {
        const stepName = `Step_Node_${index}`
        cy.wrap($node).click({ force: true })
        cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType(stepName, 'ProvR_')
        applyChanges()
        assertNodeVisible(getName(stepName, 'ProvR_'))
      }
    })

    updateStepGroupName(1, 'ProvR_')
  })

  it(`CD Stage Infrastructure Dynamic Provisioning Rollback Steps Toggle`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sProvisionExecution'
    }).as('pipelineDetails')

    visitStepsGraph()
    cy.contains('span', 'Environment').click()
    cy.wait('@piplelineVariables')
    cy.contains(
      'span',
      'Provision your target infrastructure dynamically during the execution of your Pipeline'
    ).scrollIntoView()
    // Switch to Rollback Steps and assert studio assertions
    switchExecutionRollback(true)

    cy.contains('p', 'Add Step').click({ force: true })
    cy.findByTestId('addStepPipeline').click()
    cy.wait('@stepLibrary')
    addStepFromDrawer('Dry Run')
    cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Dummy_Step')
    applyChanges()

    // Rollback steps
    for (let n = 0; n < 4; n++) {
      cy.get('span[data-icon="zoom-out"]').eq(1).click({ force: true })
    }

    nodesAdditionLinkNode('Prov_')
    // Verify toggle on steps and disable to check
    IS_NODE_TOGGLE_DISABLED && toggleAndVerifyStepOrGroupNode(11, 5, true)
  })

  it(`CD Stage Execution Steps Duplicate Identifiers`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8s' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({})
  })

  it(`CD Stage Execution Steps Add Link Node Addition`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8s' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    nodesAdditionLinkNode()
    // Edit/Update steps on selection and drawer closing
    cy.get('.default-node').each(($node, index) => {
      // Exclude stage node
      if (index > 0) {
        const stepName = `Step_Node_${index}`
        cy.wrap($node).click({ force: true })
        cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType(stepName)
        applyChanges()
        assertNodeVisible(getName(stepName))
      }
    })
  })

  it(`CD Stage Execution Steps Add Template Node and Update Step/StepGroup`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8s' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({})

    updateStepGroupName(4)
    // Add template step
    cy.get('[class*="addNodeIcon"]').eq(1).click({ force: true })
    cy.contains('span', 'Use template').click({ force: true })
    cy.wait('@templateList')
    cy.get('[class*="templateCard"]').eq(0).click({ force: true })
    cy.wait('@templateListCallAfterSelection')
    cy.wait('@templateInputs')
    cy.wait('@piplelineVariables')
    cy.get('[class*="btnContainer"]>button').eq(0).should('be.visible').click({ force: true })
    cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType('Template_Node_1')
    applyChanges()
    assertNodeVisible(getName('Template_Node_1'))
  })

  it(`CD Stage Execution Steps Node Toggle`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8s' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    nodesAdditionLinkNode()
    // Verify toggle on steps and disable to check
    IS_NODE_TOGGLE_DISABLED && toggleAndVerifyStepOrGroupNode(6, 1)
  })

  it(`CD Stage Execution Steps Update Steps to Template`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8s' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    nodesAdditionLinkNode()
    // Save step as template and replace step with template
    updateStepsToTemplateNodes()
  })

  it(`CD Stage Execution RollbackSteps Duplicate Identifier`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sWithExecutionSteps'
    }).as('pipelineDetails')

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    // Switch to Rollback Steps and assert studio assertions
    switchExecutionRollback(true)
    collapseSideNavAndZoomOut()
    duplicateIdentifiersScenarios({ prefix: 'Rollback_' })

    // Verify toggle on steps and disable to check
    IS_NODE_TOGGLE_DISABLED && toggleAndVerifyStepOrGroupNode(11, 5)
  })

  it(`CD Stage Execution RollbackSteps Duplicate Identifier`, () => {
    cy.intercept('GET', pipelineDetails, {
      fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalK8sWithExecutionSteps'
    }).as('pipelineDetails')

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    // Switch to Rollback Steps and assert studio assertions
    switchExecutionRollback(true)
    collapseSideNavAndZoomOut()

    nodesAdditionLinkNode('Rollback_')
  })

  it(`CI Stage Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalCI' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({})
  })
  it(`CI Stage Execution Steps add link node + toggle`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalCI' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    nodesAdditionLinkNode()
    // Edit/Update steps on selection and drawer closing
    cy.get('.default-node').each(($node, index) => {
      // Exclude stage node
      if (index > 0) {
        const stepName = `Step_Node_${index}`
        cy.wrap($node).click({ force: true })
        cy.get('input[name="name"]').should('be.visible').clear().pipelineStudioType(stepName)
        applyChanges()
        assertNodeVisible(getName(stepName))

        // Verify toggle on steps and disable to check
        IS_NODE_TOGGLE_DISABLED && toggleAndVerifyStepOrGroupNode(6, 1)
      }
    })
  })

  it(`Approval Stage Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalApproval' }).as(
      'pipelineDetails'
    )
    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({})
  })

  it(`FF Stage Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalFF' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({ disableStepGroup: true })
  })

  it(`STO Stage Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalSTO' }).as(
      'pipelineDetails'
    )

    visitStepsGraph()
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({})
  })

  it(`Custom Stage Execution Steps`, () => {
    cy.intercept('GET', pipelineDetails, { fixture: 'ng/api/pipelineStudioGraph/pipelineV2MinimalCustom' }).as(
      'pipelineDetails'
    )

    visitExecutionStageWithAssertion()

    cy.get(`div[data-testid="pipeline-studio"]`, {
      timeout: 5000
    }).should('be.visible')
    cy.contains('p', 'testStage_Cypress').click({ force: true })
    cy.contains('span', 'Execution').click()
    collapseSideNavAndZoomOut()
    // Execution steps
    duplicateIdentifiersScenarios({})
  })
})
