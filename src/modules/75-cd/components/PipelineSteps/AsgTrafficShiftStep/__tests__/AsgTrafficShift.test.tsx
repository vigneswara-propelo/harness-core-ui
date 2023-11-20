import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute, doConfigureOptionsTesting } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { AsgTrafficShift } from '../AsgTrafficShiftStep'

factory.registerStep(new AsgTrafficShift())

const existingInitialValues = {
  identifier: 'Step_AsgTrafficShiftService',
  name: 'Step AsgTrafficShiftService',
  timeout: '10m',
  type: StepType.AsgShiftTraffic,
  spec: {
    downsizeOldAsg: false,
    weight: 1
  }
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('Asg Traffic Shift Step tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: '',
          name: '',
          timeout: '10m',
          type: StepType.AsgShiftTraffic,
          spec: {
            downsizeOldAsg: false,
            weight: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.AsgShiftTraffic}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    await userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    await userEvent.clear(timeoutInput!)
    await userEvent.type(timeoutInput!, '20m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('20m'))

    const oldAsgCheckbox = queryByNameAttribute('spec.downsizeOldAsg', container) as HTMLElement
    expect(oldAsgCheckbox).not.toBeChecked()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const weightInput = queryByNameAttribute('spec.weight', container) as HTMLInputElement
    expect(weightInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogWeightInputRef = document.getElementById('configureOptions_spec.weight')
    await userEvent.click(cogWeightInputRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const weightRefCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(weightRefCOG, weightInput)

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '20m',
        type: StepType.AsgShiftTraffic,
        spec: {
          downsizeOldAsg: false,
          weight: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_AsgTrafficShift',
          name: 'Step Asg Traffic Shift',
          timeout: '',
          type: StepType.AsgShiftTraffic,
          spec: {
            downsizeOldAsg: false,
            weight: 1
          }
        }}
        template={{
          identifier: 'Step_AsgTrafficShift',
          name: 'Step Asg Traffic Shift',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.AsgShiftTraffic,
          spec: {
            downsizeOldAsg: RUNTIME_INPUT_VALUE,
            weight: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.AsgShiftTraffic}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        onChange={onChange}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    await userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    await userEvent.type(timeoutInput!, '20m')
    await userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_AsgTrafficShift',
      name: 'Step Asg Traffic Shift',
      timeout: '20m',
      type: StepType.AsgShiftTraffic,
      spec: {
        downsizeOldAsg: false,
        weight: 1
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.AsgShiftTraffic}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step AsgTrafficShift': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AsgTrafficShift.name',
                localName: 'step.AsgTrafficShift.name'
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.AsgTrafficShift.timeout',
                localName: 'step.AsgTrafficShift.timeout'
              }
            }
          }
        }}
      />
    )
    expect(container).toBeDefined()
  })
})

test('Template view renders fine', async () => {
  const { container } = render(
    <TestStepWidget
      initialValues={{
        identifier: 'Step_AsgTrafficShift',
        name: 'Step Asg Traffic Shift',
        timeout: RUNTIME_INPUT_VALUE,
        type: StepType.AsgShiftTraffic,
        spec: {
          downsizeOldAsg: RUNTIME_INPUT_VALUE,
          weight: RUNTIME_INPUT_VALUE
        }
      }}
      type={StepType.AsgShiftTraffic}
      stepViewType={StepViewType.Template}
      onUpdate={onUpdate}
      onChange={onChange}
    />
  )

  const connectorRefInput = queryByNameAttribute('spec.downsizeOldAsg', container) as HTMLInputElement
  expect(connectorRefInput).toBeInTheDocument()
  expect(connectorRefInput.value).toBe(RUNTIME_INPUT_VALUE)

  const jobNameInput = queryByNameAttribute('spec.weight', container) as HTMLInputElement
  expect(jobNameInput).toBeInTheDocument()
  expect(jobNameInput.value).toBe(RUNTIME_INPUT_VALUE)

  const jobParameterInput = queryByNameAttribute('timeout', container) as HTMLInputElement
  expect(jobParameterInput).toBeInTheDocument()
  expect(jobParameterInput.value).toBe(RUNTIME_INPUT_VALUE)
})
