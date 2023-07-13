import React from 'react'
import * as Formik from 'formik'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import VerificationTypeDropdown from '../VerificationTypeDropdown'
import { continousVerificationTypes } from '../../constants'

describe('VerificationTypeDropdown', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
  const setFieldValueMock = jest.fn()
  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      isValid: true,
      setFieldValue: setFieldValueMock
    } as unknown as any)
  })
  test('should not make the form update if user clicked on same verification type again', async () => {
    render(
      <TestWrapper>
        <Formik.Formik initialValues={{}} onSubmit={() => Promise.resolve()}>
          <VerificationTypeDropdown verificationTypeOptions={continousVerificationTypes} />
        </Formik.Formik>
      </TestWrapper>
    )

    const verificationTypeDropdown = screen.getByTestId(/selectedVerificationDisplay/)
    const verificationTypeLabel = screen.queryByTestId(/selectedVerificationLabel/)

    expect(verificationTypeDropdown).toBeInTheDocument()
    expect(verificationTypeLabel).not.toBeInTheDocument()

    await userEvent.click(verificationTypeDropdown)

    expect(screen.getByText(/Auto/)).toBeInTheDocument()
    expect(screen.getByText(/Rolling Update/)).toBeInTheDocument()
    expect(screen.getByText(/Canary/)).toBeInTheDocument()
    expect(screen.getByText(/Blue Green/)).toBeInTheDocument()
    expect(screen.getByText(/Load Test/)).toBeInTheDocument()

    const blueGreenOption = screen.getByText(/Blue Green/)

    await userEvent.click(blueGreenOption)

    await waitFor(() => expect(setFieldValueMock).toHaveBeenCalledWith('spec.type', 'Bluegreen'))

    const verificationTypeLabel2 = screen.getByTestId(/selectedVerificationLabel/)

    await waitFor(() => expect(verificationTypeLabel2).toBeInTheDocument())
    await waitFor(() => expect(verificationTypeLabel2).toHaveTextContent(/Blue Green/))

    setFieldValueMock.mockClear()

    await userEvent.click(verificationTypeDropdown)

    await userEvent.click(blueGreenOption)

    await waitFor(() => expect(setFieldValueMock).not.toHaveBeenCalledWith())
  })
})
