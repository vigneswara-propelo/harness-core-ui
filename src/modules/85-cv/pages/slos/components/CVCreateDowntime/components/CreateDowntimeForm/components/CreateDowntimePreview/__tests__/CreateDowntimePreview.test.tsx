/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { getDowntimeInitialFormData } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'
import { downtimeResponse } from '@cv/pages/slos/components/CVCreateDowntime/__tests__/CVCreateDowntime.mock'
import type { DowntimeDTO } from 'services/cv'
import { CreateDowntimeSteps } from '../../../CreateDowntimeForm.types'
import { CreateDowntimePreview } from '../CreateDowntimePreview'

describe('CreateDowntimePreview', () => {
  test('should render CreateDowntimePreview with empty value', async () => {
    const { container } = render(
      <TestWrapper>
        <CreateDowntimePreview id={'' as any} data={{} as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render CreateDowntimePreview with init value', async () => {
    const { container } = render(
      <TestWrapper>
        <CreateDowntimePreview id={CreateDowntimeSteps.DEFINE_DOWNTIME} data={getDowntimeInitialFormData()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('should render CreateDowntimePreview with correct values', async () => {
    const { container } = render(
      <TestWrapper>
        <CreateDowntimePreview
          id={CreateDowntimeSteps.DEFINE_DOWNTIME}
          data={getDowntimeInitialFormData(downtimeResponse.resource.downtime as DowntimeDTO)}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
