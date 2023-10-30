/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import AppErrorBoundary from '../AppErrorBoundary/AppErrorBoundary'
import i18n from '../AppErrorBoundary/AppErrorBoundary.i18n.json'

describe('AppErrorBoundary tests', () => {
  test(`shows the fallback when there's an error`, () => {
    const Throws = (): JSX.Element => {
      throw new Error('Error happened!')
    }

    const { getByText, unmount } = render(
      <AppErrorBoundary>
        <Throws />
      </AppErrorBoundary>
    )
    expect(getByText(i18n.title)).toBeDefined()
    unmount()
  })

  test('logging to bugsnag when its enabled', () => {
    const Throws = (): JSX.Element => {
      throw new Error('Error happened!')
    }
    let notifiedCalled = false
    const bugSnagClient = {
      notify: (_e: any) => {
        notifiedCalled = true
      }
    }
    window['bugsnagClient'] = bugSnagClient
    const { unmount } = render(
      <AppErrorBoundary>
        <Throws />
      </AppErrorBoundary>
    )
    expect(notifiedCalled).toBeTruthy()
    unmount()
  })

  test(`should call custom callback if provided`, () => {
    const refreshHandler = jest.fn()
    const Throws = (): JSX.Element => {
      throw new Error('Error happened!')
    }

    const { getByText, unmount } = render(
      <AppErrorBoundary onRefreshClick={refreshHandler}>
        <Throws />
      </AppErrorBoundary>
    )

    fireEvent.click(getByText('refresh'))
    expect(refreshHandler).toBeCalled()
    unmount()
  })
})
