import React from 'react'

import { render } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { Intent } from '@harness/design-system'

import { TestWrapper } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { MultiTypeExecutionTargetGroup } from '../ExecutionTargetGroup'
import { ShellScriptFormData } from '../shellScriptTypes'

describe('Execution target group tests', () => {
  test('when execution target group- targethost is selected', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<ShellScriptFormData>
          formName="test-form"
          initialValues={{
            spec: { onDelegate: false },
            name: 'test',
            identifier: 'test',
            type: StepType.SHELLSCRIPT
          }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <FormikForm>
              <MultiTypeExecutionTargetGroup
                name="spec.onDelegate"
                formik={formik as any}
                readonly={false}
                tooltipProps={{ dataTooltipId: 'targetGrp' }}
                label={'onDelegate'}
                intent={Intent.PRIMARY}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when execution target group- delegate is selected', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<ShellScriptFormData>
          formName="test-form"
          initialValues={{
            spec: { onDelegate: 'delegate' },
            name: 'test',
            identifier: 'test',
            type: StepType.SHELLSCRIPT
          }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <FormikForm>
              <MultiTypeExecutionTargetGroup
                name="spec.onDelegate"
                formik={formik as any}
                readonly={false}
                label={'onDelegate'}
                tooltipProps={{ dataTooltipId: 'targetGrp' }}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when intent hasError', () => {
    const { container } = render(
      <TestWrapper>
        <Formik<ShellScriptFormData>
          formName="test-form"
          initialValues={{
            spec: { onDelegate: 'delegate' },
            name: 'test',
            identifier: 'test',
            type: StepType.SHELLSCRIPT
          }}
          onSubmit={jest.fn()}
        >
          {formik => (
            <FormikForm>
              <MultiTypeExecutionTargetGroup
                name="spec.onDelegate"
                formik={formik as any}
                readonly={false}
                label={'onDelegate'}
                tooltipProps={{ dataTooltipId: 'targetGrp' }}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
