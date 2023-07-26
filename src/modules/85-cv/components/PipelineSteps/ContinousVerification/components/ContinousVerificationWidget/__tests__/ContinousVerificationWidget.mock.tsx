/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps, useFormikContext } from 'formik'
import { ContinousVerificationData } from '../../../types'

export const mockedTemplateInputsToValidate = {
  identifier: '<+monitoredService.serviceRef>_<+monitoredService.environmentRef>',
  type: 'Application',
  serviceRef: '<+input>',
  environmentRef: '<+input>',
  sources: {
    healthSources: [
      {
        identifier: 'Appd',
        type: 'AppDynamics',
        spec: {
          applicationName: '<+input>',
          tierName: '<+input>',
          metricDefinitions: [
            {
              identifier: 'appdMetric',
              completeMetricPath: '<+input>',
              analysis: {
                deploymentVerification: {
                  serviceInstanceMetricPath: '<+input>'
                }
              }
            }
          ],
          connectorRef: '<+input>'
        }
      }
    ]
  },
  variables: [
    {
      name: 'connectorVariable',
      type: 'String',
      value: '<+input>'
    }
  ]
}

export const mockedTemplateInputs = {
  identifier: '<+monitoredService.serviceRef>_<+monitoredService.environmentRef>',
  type: 'Application',
  sources: {
    healthSources: [
      {
        identifier: 'Appd',
        type: 'AppDynamics',
        spec: {
          metricDefinitions: [
            {
              identifier: 'appdMetric',
              analysis: {
                deploymentVerification: {}
              }
            }
          ],
          connectorRef: ''
        }
      }
    ]
  },
  variables: [
    {
      name: 'connectorVariable',
      type: 'String'
    }
  ]
}

export const expectedErrorsForEmptyTemplateInputs = {
  spec: {
    monitoredService: {
      spec: {
        templateInputs: {
          environmentRef: 'cv.monitoringSources.envValidation',
          serviceRef: 'cv.monitoringSources.serviceValidation',
          sources: {
            healthSources: [
              {
                spec: {
                  applicationName: 'platform.connectors.cdng.validations.applicationNameValidation',
                  connectorRef: 'platform.connectors.validation.connectorIsRequired',
                  metricDefinitions: [
                    {
                      analysis: {
                        deploymentVerification: {
                          serviceInstanceMetricPath:
                            'platform.connectors.cdng.validations.serviceInstanceMetricPathValidation'
                        }
                      },
                      completeMetricPath: 'platform.connectors.cdng.validations.completeMetricPathValidation'
                    }
                  ],
                  tierName: 'platform.connectors.cdng.validations.tierNameValidation'
                }
              }
            ]
          },
          variables: [
            {
              value: 'connectorVariable is required'
            }
          ]
        }
      },
      type: 'Template Selection is required.'
    }
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const formikMockValues: FormikProps<ContinousVerificationData> = {
  setFieldValue: jest.fn(),
  values: {
    type: 'Verify',
    name: 'Verify',
    identifier: 'Verify',
    timeout: '30m',
    spec: {
      type: 'Auto',
      monitoredService: {
        type: 'Default',
        spec: {}
      },
      spec: {
        sensitivity: {
          label: 'High',
          value: 'HIGH'
        },
        duration: {
          label: '10 min',
          value: '10m'
        },
        deploymentTag: 'test',
        failOnNoAnalysis: true,
        baseline: '',
        trafficsplit: ''
      },
      isMultiServicesOrEnvs: false,
      monitoredServiceRef: '',
      healthSources: [],
      initialMonitoredService: {
        type: 'Default',
        spec: {}
      }
    },
    failureStrategies: [
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
}

export const formikMockValuesWithSimpleVerification: FormikProps<ContinousVerificationData> = {
  ...formikMockValues,
  values: {
    ...formikMockValues.values,
    spec: {
      ...formikMockValues.values.spec,
      type: 'SimpleVerification'
    }
  }
}

export const formikMockValuesWithRolling: FormikProps<ContinousVerificationData> = {
  ...formikMockValues,
  values: {
    ...formikMockValues.values,
    spec: {
      ...formikMockValues.values.spec,
      type: 'Rolling'
    }
  }
}

export const formikMockValuesWithAuto: FormikProps<ContinousVerificationData> = {
  ...formikMockValues,
  values: {
    ...formikMockValues.values,
    spec: {
      ...formikMockValues.values.spec,
      type: 'Auto'
    }
  }
}

export function MockSensitivityComponent(): JSX.Element {
  const { values } = useFormikContext<ContinousVerificationData>()

  return (
    <>
      {values.spec.spec?.sensitivity !== undefined && <div data-testid="sensitivity"></div>}
      {values.spec.spec?.failOnNoAnalysis !== undefined && <div data-testid="failOnNoAnalysis"></div>}
    </>
  )
}
