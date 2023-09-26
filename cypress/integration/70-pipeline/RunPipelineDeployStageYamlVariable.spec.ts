import {
  gitSyncEnabledCall,
  featureFlagsCall,
  cdFailureStrategiesYaml,
  pipelineVariablesCall,
  resolvedPipelineDetailsCall,
  servicesCallRunPipeline,
  servicesYaml,
  environmentsCallRunPipeline,
  connectorsCall,
  servicesV2CallWithPageAndTemplateFilter,
  servicesV2Response,
  environmentV2CallWithPage,
  environmentV2Response,
  serviceV2YamlInput
} from '../../support/70-pipeline/constants'

describe('Checks visual to YAML and visual to variable view parity', () => {
  beforeEach(() => {
    cy.intercept('GET', servicesCallRunPipeline, { fixture: 'ng/api/servicesV2/serviceYamlVariable' })
    cy.intercept('GET', servicesV2CallWithPageAndTemplateFilter, servicesV2Response).as('serviceV2ListCall')
    cy.intercept('GET', environmentV2CallWithPage, environmentV2Response).as('environmentV2ListCall')
    cy.intercept('GET', environmentsCallRunPipeline, { fixture: 'ng/api/environmentsV2Access' }).as('environmentCall')
    cy.intercept('GET', connectorsCall, { fixture: 'ng/api/connectors' })
    cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/runpipeline/pipelines.variables' })
    cy.intercept('POST', servicesYaml, serviceV2YamlInput).as('serviceYaml')
    cy.intercept('GET', cdFailureStrategiesYaml, { fixture: 'pipeline/api/pipelines/failureStrategiesYaml' }).as(
      'cdFailureStrategiesYaml'
    )
    cy.intercept('POST', resolvedPipelineDetailsCall, req => {
      req.continue(res => {
        res.send({
          status: 'SUCCESS',
          data: {
            mergedPipelineYaml: req.body.originalEntityYaml,
            templateReferenceSummaries: []
          },
          metaData: null,
          correlationId: 'fa9edc77-c155-42f5-b0af-93c1f0546911'
        })
      })
    })
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          {
            uuid: null,
            name: 'NG_SVC_ENV_REDESIGN',
            enabled: true,
            lastUpdatedAt: 0
          }
        ]
      }).as('enableFeatureFlag')
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.login('test', 'test')

    cy.visitCreatePipeline()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()
    cy.createKubernetesDeploymentStage()

    cy.wait(1000)
    cy.visitPageAssertion('[id*="SERVICE"]')
    // Service tab config
    cy.findByTestId('cr-field-service').click({ force: true })
    cy.wait('@serviceV2ListCall')
    cy.contains('p', 'DockerServicetest').click({ force: true })
    cy.contains('span', 'Apply Selected').click({ force: true })
    cy.wait(1000)

    // Infrastructure tab config
    cy.contains('span', 'Environment').click({ force: true })
    cy.wait(1000)
    cy.findByTestId('cr-field-environment').click({ force: true })
    cy.wait('@environmentV2ListCall')
    cy.contains('p', 'EnvironmentTest').click({ force: true })
    cy.contains('span', 'Apply Selected').click({ force: true })
    cy.wait(1000)
    cy.selectRuntimeInputForInfrastructure()
  })

  it('visual to YAML conversion for stage configuration', () => {
    // Toggle to YAML view

    cy.get('[data-name="toggle-option-two"]').click({ force: true })
    cy.wait(1000)

    cy.contains('div', 'Unsaved changes').should('be.visible')
    //Verify all details in YAML view
    cy.contains('span', 'testPipeline_Cypress').should('be.visible')
    cy.contains('span', 'testStage_Cypress').should('be.visible')

    cy.scrollTo('top')
    cy.contains('span', 'Deployment').should('be.visible')

    cy.contains('span', 'serviceRef').should('be.visible')
    cy.contains('span', 'DockerServicetest').should('be.visible')

    cy.contains('span', 'environmentRef').should('be.visible')
    cy.contains('span', 'EnvironmentTest').should('be.visible')

    cy.contains('span', 'K8sManifest').should('be.visible')
    cy.contains('span', 'DockerRegistry').should('be.visible')
    cy.contains('span', 'testManifestName').should('be.visible')
    cy.contains('span', 'connectorRef').should('be.visible')
  })

  it('visual to variable view for stage configuration', () => {
    // Toggle to variable view
    cy.contains('span', 'Variables').click()
    cy.wait(2000)
    cy.get('#pipeline-panel').within(() => {
      cy.contains('span', 'testStage_Cypress').should('be.visible')
      cy.contains('span', 'testPipeline_Cypress').should('be.visible')
    })
  })
})
