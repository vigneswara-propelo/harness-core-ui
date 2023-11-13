import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Form, Formik } from 'formik'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@modules/10-common/utils/testUtils'
import inputComponentFactory from '@pipeline/y1/components/InputFactory/InputComponentFactory'

const failureStrategyInput = inputComponentFactory.getComponent('failure_strategy')!

describe('FailureStrategyInput', () => {
  test('should render and set field value as expected', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(
      <TestWrapper>
        <Formik onSubmit={onSubmit} initialValues={{ failure: null }}>
          {() => (
            <Form>
              {failureStrategyInput.renderComponent({
                factory: inputComponentFactory,
                path: 'failure',
                allowableTypes: [MultiTypeInputType.FIXED],
                input: {
                  name: 'failure',
                  type: 'object',
                  dependencies: [],
                  metadata: {
                    type: 'object',
                    internal_type: 'failure_strategy'
                  },
                  allMetadata: [],
                  hasMultiUsage: false
                }
              })}

              <button type="submit">submit</button>
            </Form>
          )}
        </Formik>
      </TestWrapper>
    )

    await user.click(await screen.findByTestId('add-failure-strategy'))
    await user.click(screen.getByText('common.allErrors'))
    await user.click(screen.getByText('pipeline.failureStrategies.strategiesLabel.Abort'))
    await user.click(screen.getByRole('button', { name: 'submit' }))

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          failure: [
            {
              errors: ['all'],
              action: {
                type: 'abort'
              }
            }
          ]
        },
        expect.anything()
      )
    )
  })
})
