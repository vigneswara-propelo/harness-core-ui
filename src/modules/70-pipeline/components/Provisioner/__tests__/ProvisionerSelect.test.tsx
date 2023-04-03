/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import type { ExecutionWrapperConfig } from 'services/cd-ng'

import { provisionersMock } from './mock'

import ProvisionerSelectField from '../ProvisionerSelect'

describe('<ProvisionerSelectField /> tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should render Provisioner select field', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CD_NG_DYNAMIC_PROVISIONING_ENV_V2: true
    })
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{ provisioner: 'test1' }} onSubmit={() => undefined} formName="TestWrapper">
          <ProvisionerSelectField
            name="provisioner"
            provisioners={[...provisionersMock] as ExecutionWrapperConfig[]}
            path={''}
          />
        </Formik>
      </TestWrapper>
    )
    const provSelectField = container.querySelector('.bp3-input-group')
    expect(provSelectField).toBeInTheDocument()

    fireEvent.click(provSelectField!)
    await waitFor(() => expect(container.querySelector('.bp3-menu')).toBeNull())
  })
})
