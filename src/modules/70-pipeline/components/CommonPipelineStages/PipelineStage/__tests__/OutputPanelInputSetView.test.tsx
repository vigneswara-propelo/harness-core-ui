/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, screen } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'
import { Formik } from 'formik'
import { has, isMatch } from 'lodash-es'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import type { StringKeys } from 'framework/strings'
import { getModuleParams } from './PipelineStageHelper'
import {
  OutputPanelInputSetProps,
  PipelineStageOutputData,
  validateOutputPanelInputSet
} from '../PipelineStageOutputSection/utils'
import { OutputPanelInputSetView } from '../PipelineStageOutputSection/OutputPanelInputSetView'

interface TestComponentProps extends OutputPanelInputSetProps {
  initialValues: PipelineStageOutputData
  testWrapperProps?: TestWrapperProps
}

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })
const queryByName = <T extends HTMLElement>(name: string, container: HTMLElement): T | null =>
  queryByAttribute('name', container, name) as T

function getString(key: StringKeys): StringKeys {
  return key
}

function TestComponent(props: TestComponentProps): React.ReactElement {
  const { initialValues, testWrapperProps, ...rest } = props
  return (
    <TestWrapper path={TEST_PATH} pathParams={getModuleParams('chainedPipeline', 'cd')} {...testWrapperProps}>
      <Formik onSubmit={jest.fn()} initialValues={initialValues}>
        <OutputPanelInputSetView {...rest} />
      </Formik>
    </TestWrapper>
  )
}

describe('<OutputPanelInputSetView /> tests', () => {
  test('renders correctly', async () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          outputs: [
            { name: 'output1', value: 'oldvalue1' },
            { name: 'output2', value: '<+input>' },
            { name: 'output3', value: 'oldvalue3' },
            { name: 'output4', value: '<+input>' }
          ]
        }}
        path={'outputs'}
        template={{
          outputs: [
            { name: 'output1', value: '<+input>' },
            { name: 'output2', value: '<+input>' },
            { name: 'output3', value: '<+input>' },
            { name: 'output4', value: '<+input>' }
          ]
        }}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
      />
    )

    expect(queryByName<HTMLInputElement>('outputs[0].value', container)?.value).toBe('oldvalue1')
    expect(queryByName<HTMLInputElement>('outputs[1].value', container)?.value).toBe('<+input>')
    expect(queryByName<HTMLInputElement>('outputs[2].value', container)?.value).toBe('oldvalue3')
    expect(queryByName<HTMLInputElement>('outputs[3].value', container)?.value).toBe('<+input>')
  })

  test('should render template runtime value outputs + readonly view', async () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          outputs: [
            { name: 'output1', value: 'oldvalue1' },
            { name: 'output2', value: '<+input>' },
            { name: 'output3', value: 'oldvalue3' },
            { name: 'output4', value: '<+input>' }
          ]
        }}
        path={'outputs'}
        template={{
          outputs: [
            { name: 'output1', value: '<+input>' },
            { name: 'output2', value: '<+input>' },
            { name: 'output3', value: '<+input>' },
            { name: 'output4', value: '<+input>' },
            { name: 'output5', value: 'dummy' }
          ]
        }}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
        readonly
      />
    )

    expect(queryByName<HTMLInputElement>('outputs[0].value', container)).toHaveAttribute('disabled')
    expect(screen.queryByText('output5')).not.toBeInTheDocument()
  })

  test('test validateOutputPanelInputSet method', () => {
    const errors = validateOutputPanelInputSet({
      data: {
        outputs: [
          { name: 'output1', value: '' },
          { name: 'output2', value: '' },
          { name: 'output3', value: 'oldvalue3' }
        ]
      },
      template: {
        outputs: [
          { name: 'output1', value: '<+input>' },
          { name: 'output2', value: '<+input>' },
          { name: 'output3', value: '<+input>' }
        ]
      },
      getString
    })
    expect(has(errors, 'outputs')).toBeTruthy()
    expect(errors.outputs).toHaveLength(2)
    expect(isMatch(errors, { outputs: [{ value: 'fieldRequired' }, { value: 'fieldRequired' }] })).toBeTruthy()
  })
})
