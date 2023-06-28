/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Dialog, useToggleOpen } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import NetworkDiscoveryModal from '../NetworkDiscoveryModal'

function WrapperComponent(): React.ReactElement {
  const { isOpen, open, close } = useToggleOpen()

  return (
    <div>
      <Dialog isOpen={isOpen} enforceFocus={false} title={'Network Discovery Modal'} onClose={close}>
        <NetworkDiscoveryModal />
      </Dialog>
      <button name="Open dialog" onClick={() => open()} />
    </div>
  )
}

describe('NetworkDiscoveryModal', () => {
  test('render component to match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render component', async () => {
    const { getByRole, getByText } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )
    await userEvent.click(getByRole('button'))
    expect(getByText('discovery.discoverServices')).toBeInTheDocument()
  })
})
