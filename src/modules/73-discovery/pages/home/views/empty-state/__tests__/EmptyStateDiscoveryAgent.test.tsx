/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { Button } from '@harness/uicore'
import { Drawer, Position } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import EmptyStateDiscoveryAgent from '../EmptyStateDiscoveryAgent'

function WrapperComponent(): React.ReactElement {
  const [isOpen, setDrawerOpen] = useState<boolean>(false)

  return (
    <div>
      <EmptyStateDiscoveryAgent setDrawerOpen={setDrawerOpen} />
      <Drawer position={Position.RIGHT} isOpen={isOpen} isCloseButtonShown={true} size={'86%'}>
        <Button minimal icon="cross" withoutBoxShadow onClick={() => setDrawerOpen(false)} />
        <p>Create DAgent</p>
      </Drawer>
    </div>
  )
}

describe('EmptyStateDiscoveryAgent', () => {
  test('render component to match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('open drawer on empty state click', async () => {
    const { getByRole, getByText } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )
    expect(getByText('discovery.homepage.noDiscoveryAgent')).toBeInTheDocument()

    act(() => {
      fireEvent.click(getByRole('button'))
    })
    await waitFor(() => expect(getByText('Create DAgent')).toBeInTheDocument())
  })
})
