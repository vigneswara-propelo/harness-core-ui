export const stageMetaCall = '/ng/api/cdStage/metadata?routingId=accountId'
export const stageMetaResponse = {
  status: 'SUCCESS',
  data: {
    environmentRef: 'version1',
    serviceRef: 'testService',
    serviceEnvRefList: [
      {
        environmentRef: 'version1',
        serviceRef: 'testService'
      }
    ]
  },
  metaData: null,
  correlationId: 'bd7f27bb-8f8b-4530-8241-2a46640f414f'
}

export const AnalyseDefault = {
  status: 'SUCCESS',
  data: {
    yamlPipeline:
      'pipeline:\n  name: Analyse Default\n  identifier: Analyse_Default\n  projectIdentifier: templatetesting2\n  orgIdentifier: cvng\n  tags: {}\n  stages:\n    - stage:\n        name: Stage Default\n        identifier: Stage_Default\n        description: ""\n        type: Deployment\n        spec:\n          deploymentType: Kubernetes\n          service:\n            serviceRef: testService\n          environment:\n            environmentRef: testEnv\n            deployToAll: false\n            infrastructureDefinitions:\n              - identifier: qa\n          execution:\n            steps:\n              - step:\n                  type: AnalyzeDeploymentImpact\n                  name: AnalyzeDeploymentImpact_1\n                  identifier: AnalyzeDeploymentImpact_1\n                  spec:\n                    duration: 4D\n                    monitoredService:\n                      type: Configured\n                      spec:\n                        monitoredServiceRef: orders_prod\n                  timeout: 15m\n                  failureStrategies:\n                    - onFailure:\n                        errors:\n                          - Verification\n                        action:\n                          type: ManualIntervention\n                          spec:\n                            timeout: 2h\n                            onTimeout:\n                              action:\n                                type: StageRollback\n                    - onFailure:\n                        errors:\n                          - Unknown\n                        action:\n                          type: ManualIntervention\n                          spec:\n                            timeout: 2h\n                            onTimeout:\n                              action:\n                                type: Ignore\n            rollbackSteps: []\n          serviceConfig:\n            serviceRef: testService\n            serviceDefinition:\n              spec: {}\n              type: Kubernetes\n          infrastructure:\n            infrastructureDefinition:\n              type: KubernetesDirect\n              spec:\n                connectorRef: appdtest\n                namespace: test\n                releaseName: release-<+INFRA_KEY>\n            allowSimultaneousDeployments: false\n        tags: {}\n        failureStrategies:\n          - onFailure:\n              errors:\n                - AllErrors\n              action:\n                type: StageRollback',
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    modules: ['cd', 'cv', 'pms'],
    validationUuid: '64cca2df3604cd79c730c178',
    storeType: 'INLINE'
  },
  metaData: null,
  correlationId: '72f53137-d834-4ee5-b6eb-0fbd06a3dba4'
}

export const AnalyseDefaultSummary = {
  status: 'SUCCESS',
  data: {
    name: 'Analyse Default',
    identifier: 'Analyse_Default',
    tags: {},
    version: 15,
    numOfStages: 1,
    createdAt: 1689924094426,
    lastUpdatedAt: 1691132639112,
    modules: ['cd', 'cv', 'pms'],
    executionSummaryInfo: {
      numOfErrors: [0, 0, 0, 0, 0, 0, 0],
      deployments: [0, 0, 0, 0, 1, 0, 0],
      lastExecutionTs: 1690944805217,
      lastExecutionStatus: 'Success',
      lastExecutionId: 'Sc7fyxPfT3yf4tueBUIMaQ'
    },
    filters: {
      cd: {
        deploymentTypes: ['Kubernetes'],
        environmentNames: ['testEnv'],
        serviceNames: ['testService'],
        infrastructureTypes: ['KubernetesDirect']
      },
      cv: {},
      pms: {
        stageTypes: ['Deployment'],
        featureFlagStepCount: 0
      }
    },
    stageNames: ['Stage Default'],
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    storeType: 'INLINE',
    isDraft: false
  },
  metaData: null,
  correlationId: 'd1431300-48d1-4a3b-b522-32a1fe10fa52'
}
