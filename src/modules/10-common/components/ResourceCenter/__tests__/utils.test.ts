/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  cannySupportShareYourIdeas,
  EARLY_ACCESS_LINK,
  getReleaseNotesLink,
  HARNESS_SUPPORT_LINK,
  ON_PREM_RELEASE_NOTE_LINK,
  openEarlyAccess,
  openWhatsNew,
  openZendeskSupport,
  WHATS_NEW_LINK
} from '../utils'

describe('utility test', () => {
  test('openZendeskSupport method', () => {
    window.open = jest.fn()
    // eslint-disable-next-line
    // @ts-ignore
    openZendeskSupport({ stopPropagation: jest.fn, preventDefault: jest.fn })
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(HARNESS_SUPPORT_LINK)
  })

  test('openWhatsNew method', () => {
    window.open = jest.fn()
    // eslint-disable-next-line
    // @ts-ignore
    openWhatsNew({ stopPropagation: jest.fn, preventDefault: jest.fn })
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(WHATS_NEW_LINK)
  })

  test('openEarlyAccess method', () => {
    window.open = jest.fn()
    // eslint-disable-next-line
    // @ts-ignore
    openEarlyAccess({ stopPropagation: jest.fn, preventDefault: jest.fn })
    expect(window.open).toHaveBeenCalledTimes(1)
    expect(window.open).toHaveBeenCalledWith(EARLY_ACCESS_LINK)
  })

  test('test default release notes link', () => {
    expect(getReleaseNotesLink()).toEqual(ON_PREM_RELEASE_NOTE_LINK)
  })

  test('test default release notes link', () => {
    window.releaseNotesLink = 'test'
    expect(getReleaseNotesLink()).toEqual('test')
  })

  test('test cannySupportShareYourIdeas', () => {
    const windowOpenMock = jest.fn()
    const cannyMock = jest.fn()
    window.open = windowOpenMock
    window.Canny = cannyMock
    cannySupportShareYourIdeas(
      { stopPropagation: jest.fn, preventDefault: jest.fn } as any,
      {
        uuid: 'testuuid',
        name: 'testName'
      },
      { identifier: 'accountIdentifier', cannyUsernameAbbreviationEnabled: true }
    )
    expect(cannyMock).toBeCalled()
    expect(windowOpenMock).toBeCalledTimes(1)
  })
})
