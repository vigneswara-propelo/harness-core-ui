/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const ImpactAnalysis = {
  metaData: {},
  resource: {
    id: 'Qdj2qmJaSXqI4qADfHU93g',
    accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
    orgIdentifier: 'cvng',
    projectIdentifier: 'SRM_PREQA_Sign_Off_Automation',
    serviceIdentifier: 'downtimeService',
    serviceName: 'downtimeService',
    envIdentifier: 'downtimeEnvironment',
    environmentName: 'downtimeEnvironment',
    name: 'SRM Step Analysis of downtimeService_downtimeEnvironment',
    monitoredServiceIdentifier: 'downtimeService_downtimeEnvironment',
    eventTime: 1689241311307,
    metadata: {
      analysisStartTime: 1689241311307,
      analysisEndTime: 1689414111307,
      planExecutionId: 'ecYXNSdcRjqroIDK2yXGJg',
      pipelineId: 'analyze_deployment_default',
      stageStepId: 'Em5knzwPRuiD0FrlcRI2OQ',
      stageId: 'analyze',
      analysisStatus: 'RUNNING',
      pipelinePath:
        '/account/-k53qRQAQ1O7DBLb9ACnjQ/cd/orgs/cvng/projects/SRM_PREQA_Sign_Off_Automation/pipelines/analyze_deployment_default/executions/ecYXNSdcRjqroIDK2yXGJg/pipeline?stage=Em5knzwPRuiD0FrlcRI2OQ'
    },
    category: 'Deployment',
    type: 'DeploymentImpactAnalysis'
  },
  responseMessages: []
}

export const changeDetailsMock = {
  metaData: {},
  resource: [
    {
      identifier: 'Downtime_SLO',
      name: 'Downtime SLO',
      outOfRange: false
    }
  ],
  responseMessages: []
}

export const sloDetailMock = {
  status: 'SUCCESS',
  data: {
    sloDashboardWidget: {
      sloIdentifier: 'Downtime_SLO',
      title: 'Downtime SLO',
      monitoredServiceIdentifier: 'downtimeService_downtimeEnvironment',
      monitoredServiceName: 'downtimeService_downtimeEnvironment',
      healthSourceIdentifier: 'prometheus',
      healthSourceName: 'prometheus',
      serviceIdentifier: 'downtimeService',
      serviceName: 'downtimeService',
      environmentIdentifier: 'downtimeEnvironment',
      environmentName: 'downtimeEnvironment',
      monitoredServiceDetails: [
        {
          monitoredServiceIdentifier: 'downtimeService_downtimeEnvironment',
          monitoredServiceName: 'downtimeService_downtimeEnvironment',
          healthSourceIdentifier: 'prometheus',
          healthSourceName: 'prometheus',
          serviceIdentifier: 'downtimeService',
          serviceName: 'downtimeService',
          environmentIdentifier: 'downtimeEnvironment',
          environmentName: 'downtimeEnvironment',
          projectParams: {
            accountIdentifier: '-k53qRQAQ1O7DBLb9ACnjQ',
            orgIdentifier: 'cvng',
            projectIdentifier: 'SRM_PREQA_Sign_Off_Automation'
          }
        }
      ],
      tags: {
        SANITY: ''
      },
      evaluationType: 'Window',
      sloType: 'Simple',
      burnRate: {
        currentRatePercentage: 1999.6527777777778
      },
      timeRemainingDays: 0,
      errorBudgetRemainingPercentage: -3899.3055555555557,
      errorBudgetRemaining: -5615,
      totalErrorBudget: 144,
      sloTargetType: 'Rolling',
      currentPeriodLengthDays: 10,
      currentPeriodStartTime: 1688455680000,
      currentPeriodEndTime: 1689319680000,
      sloTargetPercentage: 99.0,
      errorBudgetBurndown: [],
      sloPerformanceTrend: [],
      sloError: {
        failedState: false
      },
      errorBudgetRisk: 'EXHAUSTED',
      calculatingSLI: false,
      totalErrorBudgetApplicable: true,
      recalculatingSLI: false
    },
    description: 'DO NOT DELETE THIS',
    createdAt: 1683523857674,
    lastModifiedAt: 1689241296864,
    timeRangeFilters: [
      {
        displayName: '1 Hour',
        durationMilliSeconds: 3600000
      },
      {
        displayName: '1 Day',
        durationMilliSeconds: 86400000
      },
      {
        displayName: '1 Week',
        durationMilliSeconds: 604800000
      }
    ]
  },
  correlationId: '0d0db346-5ffe-488d-b0e8-db45a9207e1d'
}
