/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const awsRegions = {
  resource: [
    {
      name: 'GovCloud (US-West)',
      value: 'us-gov-west-1',
      valueType: null
    },
    {
      name: 'GovCloud (US-East)',
      value: 'us-gov-east-1',
      valueType: null
    },
    {
      name: 'US East (N. Virginia)',
      value: 'us-east-1',
      valueType: null
    },
    {
      name: 'US East (Ohio)',
      value: 'us-east-2',
      valueType: null
    }
  ]
}

export const getYaml = (): string => `
pipeline:
    name: Aws Lambda Pipeline
    identifier: Aws_Lambda_Pipeline
    allowStageExecutions: false
    projectIdentifier: testProject
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
              name: Stage 1
              identifier: Stage_1
              description: ""
              type: Deployment
              spec:
                  serviceConfig:
                      serviceRef: dascxzcsad
                      serviceDefinition:
                          type: AWS_SAM
                          spec:
                              variables: []
                              manifests: []
                              artifacts: {}
                  infrastructure:
                      infrastructureDefinition:
                          type: AWS_SAM
                          spec: 
                              connectorRef: 'Aws_Connector_1'
              tags: {}`

export const invalidYaml = (): string => `
pipeline: 
    name: AWS SAM Pipeline
    identifier: AWS_SAM_Pipeline
    projectIdentifier: testProject
    orgIdentifier: default
    stages
        - stage:
              name: Stage 1
              identifier: Stage_1
              type: Deployment
              spec:
              serviceConfig:

`
