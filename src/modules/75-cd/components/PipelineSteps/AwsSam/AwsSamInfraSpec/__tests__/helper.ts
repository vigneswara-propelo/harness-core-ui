/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { findAllByText, findByText, getByText, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

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

export const testConnectorRefChange = async (
  connectorRef1: string,
  connectorRef2: string,
  selected: string
): Promise<void> => {
  const dialogs = document.getElementsByClassName('bp3-dialog')
  await waitFor(() => expect(dialogs).toHaveLength(1))
  const connectorSelectorDialog = dialogs[0] as HTMLElement

  let connectorToSelect = connectorRef1
  if (selected === connectorRef1) {
    const connector1 = await findAllByText(connectorSelectorDialog, connectorRef1)
    expect(connector1).toHaveLength(2)
    connectorToSelect = connectorRef2
  } else if (selected === connectorRef2) {
    const connector2 = await findAllByText(connectorSelectorDialog, connectorRef2)
    expect(connector2).toHaveLength(2)
    connectorToSelect = connectorRef1
  } else {
    const connector2 = await findByText(connectorSelectorDialog, connectorRef2)
    expect(connector2).toBeInTheDocument()
    connectorToSelect = connectorRef1
  }

  const connectorToSelectElementItem = getByText(connectorSelectorDialog, connectorToSelect)
  expect(connectorToSelectElementItem).toBeInTheDocument()
  userEvent.click(connectorToSelectElementItem)
  const applySelected = getByText(connectorSelectorDialog, 'entityReference.apply')
  userEvent.click(applySelected)
  await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
}
