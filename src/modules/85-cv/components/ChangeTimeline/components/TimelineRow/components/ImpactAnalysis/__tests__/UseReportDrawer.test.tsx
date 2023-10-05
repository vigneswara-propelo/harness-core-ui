/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useReportDrawer } from '../UseReportDrawer'

jest.mock(
  '@cv/pages/monitored-service/components/ServiceHealth/components/ReportsTable/ReportDrawer/ReportDrawer',
  () => ({
    __esModule: true,
    default: function ReportDrawer() {
      return <span data-testid="report-drawer" />
    }
  })
)

describe('Test  UseReportDrawer', () => {
  test('should render hook', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>
        <>{children}</>
      </TestWrapper>
    )
    const { result } = renderHook(() => useReportDrawer(), { wrapper })
    result?.current?.showDrawer({ executionDetailIdentifier: 'reportId' })
    expect(result?.current).toEqual({
      showDrawer: expect.any(Function)
    })
  })

  test('should open drawer', () => {
    const Wrapper = (): JSX.Element => {
      const { showDrawer } = useReportDrawer()
      return <div onClick={() => showDrawer({ executionDetailIdentifier: 'reportId' })}>Open Drawer</div>
    }
    const { getByText } = render(
      <TestWrapper>
        <Wrapper />
      </TestWrapper>
    )
    fireEvent.click(getByText('Open Drawer'))

    expect(document.querySelector('span[data-testid="report-drawer"]')).toBeInTheDocument()
  })
})
