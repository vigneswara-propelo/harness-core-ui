/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { NodeMetadataProvider } from '@pipeline/components/PipelineDiagram/Nodes/NodeMetadataContext'
import { InfraProvisioning } from './InfraProvisioning'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothi
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

describe('InfraProvisioning', () => {
  beforeAll(() => {
    factory.registerStep(new InfraProvisioning())
  })

  test(' click on checkbox- should open up prov popup', async () => {
    const { container } = render(
      <NodeMetadataProvider>
        <TestStepWidget
          initialValues={{
            provisioner: {},
            provisionerEnabled: false,
            provisionerSnippetLoading: false
          }}
          type={StepType.InfraProvisioning}
          stepViewType={StepViewType.Edit}
        />
      </NodeMetadataProvider>
    )

    await act(async () => {
      const provCheckbox = container.querySelector('input[name="provisionerEnabled"]')

      fireEvent.click(provCheckbox!)
      expect(container).toMatchSnapshot()
    })
  })
})
