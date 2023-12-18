import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Formik } from '@harness/uicore'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'

import ProviderSelectField from '../K8sProvider'

describe('<ProviderSelectField /> tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should render Provider select field', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ provider: 'SMI' }} onSubmit={() => undefined} formName="TestWrapper">
          <ProviderSelectField name="provider" path={''} />
        </Formik>
      </TestWrapper>
    )

    const providerSelectField = queryByNameAttribute('provider', container)
    expect(providerSelectField).toBeInTheDocument()
    await userEvent.click(providerSelectField!)
    const providerList = document.querySelectorAll('li[class*="Select--menuItem')
    await waitFor(() => expect(providerList).toHaveLength(2))
  })
})
