/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, waitFor } from '@testing-library/react'

export const selectAgentDropdown = async (container: HTMLElement): Promise<void> => {
  // Select Agent
  const agentDropdown = container.querySelectorAll('[data-icon="chevron-down"]')[0]
  fireEvent.click(agentDropdown)
  await waitFor(() => {
    expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(1)
  })
  fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[0])
  expect(container.querySelector('input[name="agentIdentifier"]')).toHaveValue('Agent 1')
}
