import React from 'react'
import { Formik } from 'formik'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import CVPromptCheckbox from '../CVPromptCheckbox'
import { formikMockValues } from './CVPromptCheckbox.mock'

describe('CVPromptCheckbox', () => {
  test('CVPromptCheckbox should call filterRemovedMetricNameThresholds prop when the cv is being removed for metric used in metric thresholds', async () => {
    const filterRemovedMetricNameThresholdsMock = jest.fn()
    render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <CVPromptCheckbox
            checkboxName="test"
            checked={true}
            filterRemovedMetricNameThresholds={filterRemovedMetricNameThresholdsMock}
            selectedMetric="a"
            checkBoxKey="test"
            isFormikCheckbox
            formikValues={formikMockValues}
          />
        </Formik>
      </TestWrapper>
    )

    expect(screen.getByTestId(/formikCheckbox/)).toBeInTheDocument()

    await userEvent.click(screen.getByTestId(/formikCheckbox/))

    const modalConfirmButton = screen.getByText('confirm')

    await userEvent.click(modalConfirmButton)

    await waitFor(() => expect(filterRemovedMetricNameThresholdsMock).toHaveBeenCalled())
  })
})
