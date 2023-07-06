/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { Formik, FormikForm, Button } from '@harness/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import type { NGTriggerSourceV2 } from 'services/pipeline-ng'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './scheduleMockConstants'
import { getValidationSchema, TriggerTypes } from '../utils/TriggersWizardPageUtils'
import TriggerOverviewPanel from '../views/TriggerOverviewPanel'
const defaultTriggerConfigDefaultProps = getTriggerConfigDefaultProps({})

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

jest.mock('services/pipeline-ng', () => ({
  useGetStagesExecutionList: jest.fn().mockReturnValue({
    data: {
      data: [
        {
          stageIdentifier: 'S1',
          stageName: 'S1',
          stagesRequired: [],
          toBeBlocked: false
        },
        {
          stageIdentifier: 'S2',
          stageName: 'S2',
          stagesRequired: [],
          toBeBlocked: false
        },
        {
          stageIdentifier: 'S3',
          stageName: 'S3',
          stagesRequired: [],
          toBeBlocked: false
        },
        {
          stageIdentifier: 'S4',
          stageName: 'S4',
          stagesRequired: [],
          toBeBlocked: false
        }
      ]
    }
  }),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn().mockReturnValue({
    data: {
      data: {
        pipelineYaml:
          'pipeline:\n  identifier: Remote\n  stages:\n    - stage:\n        identifier: S1\n        type: Custom\n        spec:\n          execution:\n            steps:\n              - step:\n                  identifier: ShellScript_1\n                  type: ShellScript\n                  timeout: ""\n',
        completePipelineYaml: '',
        errorResponse: false
      }
    }
  })
}))

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik
        formName="wrapperComponentForm"
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={getValidationSchema(
          TriggerTypes.SCHEDULE as unknown as NGTriggerSourceV2['type'],
          result.current.getString
        )}
        onSubmit={jest.fn()}
      >
        {formikProps => {
          return (
            <FormikForm>
              <TriggerOverviewPanel {...defaultTriggerConfigDefaultProps} formikProps={formikProps} />
              <Button text="Submit" className="submitButton" type="submit" />
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

describe('TriggerOverviewPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Trigger Overview Panel', async () => {
      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() => queryByText(container, result.current.getString('triggers.triggerOverviewPanel.title')))
      expect(container).toMatchSnapshot()
    })
  })
})
