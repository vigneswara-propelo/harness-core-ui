export const mockedMonitoredService = {
  data: {
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'Harshiltest',
      identifier: 'testtest',
      name: 'testtest',
      type: 'Application',
      description: null,
      serviceRef: 'test',
      environmentRef: 'test',
      sources: {
        healthSources: []
      }
    }
  }
}

export const mockedMonitoredServiceForFetchingDetails = {
  orgIdentifier: 'cvng',
  projectIdentifier: 'SRM_PREQA_Sign_Off_Automation',
  identifier: 'app_service_tPXQVuv7Nn_env_prod_HyWz',
  name: 'app_service_tPXQVuv7Nn_env_prod_HyWz',
  type: 'Application',
  description: '',
  serviceRef: 'app_service_tPXQVuv7Nn',
  environmentRef: 'env_prod_HyWz',
  environmentRefList: ['env_prod_HyWz'],
  tags: {},
  sources: {
    healthSources: [
      {
        name: 'cd',
        identifier: 'cd',
        type: 'CustomHealthMetric',
        spec: {
          connectorRef: 'org.Custom_App_Dynamics_Prod_Do_Not_Delete',
          metricDefinitions: [
            {
              identifier: 'CustomHealth_Metric',
              metricName: 'CustomHealth Metric',
              riskProfile: {
                category: 'Performance',
                metricType: 'OTHER',
                riskCategory: 'Performance_Other',
                thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER']
              },
              analysis: {
                liveMonitoring: {
                  enabled: false
                },
                deploymentVerification: {
                  enabled: true,
                  serviceInstanceMetricPath: "$.[*].['metricPath']"
                },
                riskProfile: {
                  category: 'Performance',
                  metricType: 'OTHER',
                  riskCategory: 'Performance_Other',
                  thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER']
                }
              },
              sli: {
                enabled: false
              },
              requestDefinition: {
                urlPath:
                  'rest/applications/Prod/metric-data?output=JSON&time-range-type=BETWEEN_TIMES&rollup=false&start-time=start_time&end-time=end_time&metric-path=Errors|ng-manager|*|Individual%20Nodes|*|Number%20of%20Errors',
                requestBody: '',
                method: 'GET',
                startTimeInfo: {
                  placeholder: 'start_time',
                  timestampFormat: 'MILLISECONDS',
                  customTimestampFormat: ''
                },
                endTimeInfo: {
                  placeholder: 'end_time',
                  timestampFormat: 'MILLISECONDS',
                  customTimestampFormat: ''
                }
              },
              queryType: 'HOST_BASED',
              metricResponseMapping: {
                metricValueJsonPath: "$.[*].['metricValues'].[*].['value']",
                timestampJsonPath: "$.[*].['metricValues'].[*].['startTimeInMillis']",
                serviceInstanceJsonPath: "$.[*].['metricPath']",
                serviceInstanceListJsonPath: '$',
                relativeMetricListJsonPath: "['metricValues']",
                relativeTimestampJsonPath: "['startTimeInMillis']",
                relativeMetricValueJsonPath: "['value']",
                relativeServiceInstanceValueJsonPath: "['metricPath']",
                timestampFormat: ''
              },
              groupName: 'a'
            }
          ]
        }
      }
    ],
    changeSources: []
  },
  dependencies: [],
  notificationRuleRefs: [],
  enabled: false
}

export const mockedAnalyseFormData = {
  type: 'AnalyzeDeploymentImpact',
  name: 'AnalyzeDeploymentImpact_1',
  identifier: 'AnalyzeDeploymentImpact_1',
  spec: {
    duration: '1D',
    monitoredService: {
      type: 'Configured',
      spec: {
        monitoredServiceRef: 'Default'
      }
    },
    monitoredServiceRef: '',
    healthSources: [
      {
        identifier: 'cd'
      }
    ],
    isMonitoredServiceDefaultInput: false
  },
  timeout: '15m',
  failureStrategies: [
    {
      onFailure: {
        errors: ['Verification'],
        action: {
          type: 'ManualIntervention',
          spec: {
            timeout: '2h',
            onTimeout: {
              action: {
                type: 'StageRollback'
              }
            }
          }
        }
      }
    },
    {
      onFailure: {
        errors: ['Unknown'],
        action: {
          type: 'ManualIntervention',
          spec: {
            timeout: '2h',
            onTimeout: {
              action: {
                type: 'Ignore'
              }
            }
          }
        }
      }
    }
  ]
}
