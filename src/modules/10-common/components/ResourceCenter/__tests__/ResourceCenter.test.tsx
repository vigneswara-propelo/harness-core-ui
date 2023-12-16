/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { communityLicenseStoreValues } from '@common/utils/DefaultAppStoreData'
import { ResourceCenter } from '../ResourceCenter'
import {
  HARNESS_API_DOCS_LINK,
  HARNESS_COMMUNITY_LINK,
  HARNESS_COMMUNITY_SLACK_LINK,
  HARNESS_SEARCH_LINK,
  HARNESS_TUTORIALS,
  HARNESS_UNIVERISITY_LINK,
  ON_PREM_RELEASE_NOTE_LINK,
  SITE_STATUS_LINK
} from '../utils'

const zendeskCreate = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      code: 201,
      message: 'ticket created'
    }
  }
}

const SAAS_RELEASE_NODE_LINK = 'test_saas_link'
window.releaseNotesLink = SAAS_RELEASE_NODE_LINK

jest.mock('services/cd-ng')
jest.mock('services/resourcegroups', () => ({
  useGetCoveoToken: jest.fn(() =>
    Promise.resolve({
      data: {
        code: 201,
        token: 'dummyToken'
      }
    })
  ),
  useCreateZendeskTicket: jest.fn(() => Promise.resolve(zendeskCreate))
}))
jest.mock('refiner-js', () => {
  return jest.fn().mockImplementation((param, callback) => {
    if (param === 'onComplete') {
      callback()
    }
  })
})

beforeEach(() => {
  window.deploymentType = 'SAAS'
})

describe('ResourceCenter', () => {
  test('Should render resource center properly', () => {
    const { container } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should render resource center properly on share your ideas', () => {
    const { getByText } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )

    const shareIdeastext = getByText('common.help')
    expect(shareIdeastext).toBeDefined()
    act(() => {
      fireEvent.click(shareIdeastext)
    })
    expect(getByText('common.resourceCenter.ticketmenu.shareYourIdeas')).toBeInTheDocument()
    act(() => {
      fireEvent.click(getByText('common.resourceCenter.ticketmenu.shareYourIdeas'))
    })
  })

  test('should render modal when click on icon', async () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <ResourceCenter />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('question'))
    await waitFor(() => {
      expect(getByText('common.resourceCenter.title')).toBeInTheDocument()
    })
  })

  test('should render feedback when click on icon', async () => {
    const featureFlags = {}

    const defaultAppStoreValues = {
      featureFlags
    }

    const { getByTestId, getByText } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <ResourceCenter />
      </TestWrapper>
    )

    fireEvent.click(getByTestId('question'))
    fireEvent.click(getByTestId('feedback'))
    await waitFor(() => {
      expect(getByText('common.resourceCenter.feedback.submit')).toBeInTheDocument()
    })
  })

  test('should render community', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <TestWrapper defaultLicenseStoreValues={communityLicenseStoreValues}>
        <ResourceCenter />
      </TestWrapper>
    )
    fireEvent.click(getByTestId('question'))
    await waitFor(() => {
      expect(getByText('Common.contactsupport')).toBeInTheDocument()
      expect(queryByText('common.resourceCenter.ticketmenu.tickets')).not.toBeInTheDocument()
    })
  })

  describe('release note', () => {
    test('release note for saas', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <ResourceCenter />
        </TestWrapper>
      )
      fireEvent.click(getByTestId('question'))
      const releaseNote = getByText('common.resourceCenter.bottomlayout.releaseNote').closest('a')
      await waitFor(() => {
        expect(releaseNote).toHaveAttribute('href', SAAS_RELEASE_NODE_LINK)
      })
    })

    test('release note for community', async () => {
      const { getByTestId, getByText } = render(
        <TestWrapper defaultLicenseStoreValues={communityLicenseStoreValues}>
          <ResourceCenter />
        </TestWrapper>
      )
      fireEvent.click(getByTestId('question'))
      const releaseNote = getByText('common.resourceCenter.bottomlayout.releaseNote').closest('a')
      await waitFor(() => {
        expect(releaseNote).toHaveAttribute('href', SAAS_RELEASE_NODE_LINK)
      })
    })

    test('release note for on prem', async () => {
      window.releaseNotesLink = ON_PREM_RELEASE_NOTE_LINK
      const { getByTestId, getByText } = render(
        <TestWrapper>
          <ResourceCenter />
        </TestWrapper>
      )
      fireEvent.click(getByTestId('question'))
      const releaseNote = getByText('common.resourceCenter.bottomlayout.releaseNote').closest('a')
      await waitFor(() => {
        expect(releaseNote).toHaveAttribute('href', ON_PREM_RELEASE_NOTE_LINK)
      })
    })

    describe('tutorials', () => {
      test('tutorials', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('common.resourceCenter.bottomlayout.tutorials').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', HARNESS_TUTORIALS)
        })
      })
    })

    describe('apidocs', () => {
      test('apidocs', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('common.resourceCenter.bottomlayout.apiDocs').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', HARNESS_API_DOCS_LINK)
        })
      })
    })

    describe('university', () => {
      test('university', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('common.resourceCenter.bottomlayout.university').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', HARNESS_UNIVERISITY_LINK)
        })
      })
    })

    describe('search', () => {
      test('search', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('search').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', HARNESS_SEARCH_LINK)
        })
      })
    })

    describe('communityforum', () => {
      test('communityforum', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('common.communityForum').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', HARNESS_COMMUNITY_LINK)
        })
      })
    })

    describe('communityslack', () => {
      test('communityslack', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('common.resourceCenter.communitySlack').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', HARNESS_COMMUNITY_SLACK_LINK)
        })
      })
    })

    describe('sitestatus', () => {
      test('sitestatus', async () => {
        jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
          SPG_MODULE_VERSION_INFO: true
        })
        const { getByTestId, getByText } = render(
          <TestWrapper>
            <ResourceCenter />
          </TestWrapper>
        )
        fireEvent.click(getByTestId('question'))
        const releaseNote = getByText('common.resourceCenter.bottomlayout.sitestatus').closest('a')
        await waitFor(() => {
          expect(releaseNote).toHaveAttribute('href', SITE_STATUS_LINK)
        })
      })
    })
  })
})

test('should render early access tabs', async () => {
  const { getByTestId } = render(
    <TestWrapper>
      <ResourceCenter />
    </TestWrapper>
  )

  fireEvent.click(getByTestId('question'))
  const earlyAccess = getByTestId('early-access')
  expect(earlyAccess).toBeDefined()
})

test('should render whats new tabs', async () => {
  jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
    SPG_MODULE_VERSION_INFO: false
  })

  const { getByTestId } = render(
    <TestWrapper>
      <ResourceCenter />
    </TestWrapper>
  )

  fireEvent.click(getByTestId('question'))
  const whatsNew = getByTestId('whats-new')
  expect(whatsNew).toBeDefined()
})

test('should render release notes tabs', async () => {
  jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
    SPG_MODULE_VERSION_INFO: true
  })

  const { getByTestId } = render(
    <TestWrapper>
      <ResourceCenter />
    </TestWrapper>
  )

  fireEvent.click(getByTestId('question'))
  const releaseNotes = getByTestId('release-notes')
  expect(releaseNotes).toBeDefined()
})

test('should render submit ticket tabs', async () => {
  jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
    SPG_MODULE_VERSION_INFO: false
  })

  const { getByTestId } = render(
    <TestWrapper>
      <ResourceCenter />
    </TestWrapper>
  )

  fireEvent.click(getByTestId('question'))
  const releaseNotes = getByTestId('submit-ticket')
  expect(releaseNotes).toBeDefined()
})

test('should render view ticket tabs', async () => {
  jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
    SPG_MODULE_VERSION_INFO: false
  })

  const { getByTestId } = render(
    <TestWrapper>
      <ResourceCenter />
    </TestWrapper>
  )

  fireEvent.click(getByTestId('question'))
  const releaseNotes = getByTestId('view-ticket')
  expect(releaseNotes).toBeDefined()
})
