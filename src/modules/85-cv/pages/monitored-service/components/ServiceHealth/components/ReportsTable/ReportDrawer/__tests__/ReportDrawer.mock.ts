/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { SRMAnalysisStepDetailDTO } from 'services/cv'

export const ReportSummary = {
  metaData: {},
  resource: {
    accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
    orgIdentifier: 'cvng',
    projectIdentifier: 'templatetesting2',
    analysisStartTime: 1692700298274,
    analysisEndTime: 1692959498274,
    analysisDuration: 259200.0,
    analysisStatus: 'RUNNING',
    monitoredServiceIdentifier: 'datadoglogs_version1',
    serviceIdentifier: 'datadoglogs',
    serviceName: 'datadoglogs',
    envIdentifier: 'env1',
    environmentName: 'env1',
    executionDetailIdentifier: 'meQWWdGOS0GVX2JZXuvqcg',
    stepName: 'AnalyzeDeploymentImpact_1'
  },
  responseMessages: []
}

export const ReportDrawerProp = {
  accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
  orgIdentifier: 'cvng',
  projectIdentifier: 'templatetesting2',
  analysisStartTime: 1691771266441,
  analysisEndTime: 1692030466441,
  analysisDuration: 259200.0,
  analysisStatus: 'RUNNING',
  monitoredServiceIdentifier: 'datadoglogs_version1',
  serviceIdentifier: 'datadoglogs',
  serviceName: 'datadoglogs',
  envIdentifier: 'env1',
  environmentName: 'env1',
  executionDetailIdentifier: '0w7TkN7wRJySbISpn2XBsg',
  stepName: 'AnalyzeDeploymentImpact_1',
  planExecutionId: 'planExecutionId1',
  stageStepId: 'stageStepId1'
} as SRMAnalysisStepDetailDTO

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
