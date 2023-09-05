/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdNgOpenApiServices from 'services/cd-ng-open-api'
import * as cdNGSVC from 'services/cd-ng'
import { ModuleVersionTable } from '../ReleaseNotesModal/ReleaseNotesTable'

jest.mock('services/cd-ng')

beforeEach(() => {
  window.deploymentType = 'SAAS'
})

describe('module version table', () => {
  describe('Rendering', () => {
    test('module version table showing up', async () => {
      jest.spyOn(cdNgOpenApiServices, 'useListModuleVersions').mockReturnValue({
        data: [
          {
            name: 'testName',
            display_name: 'testDisplayName',
            version: '7800',
            updated: 'testUpdate',
            release_notes_link: 'link'
          }
        ],
        refetch: jest.fn(),
        loading: false,
        error: null
      } as any)
      jest.spyOn(cdNGSVC, 'usePublishedDelegateVersion').mockReturnValue({
        data: {
          metaData: {},
          resource: {
            latestSupportedVersion: '23.08.80308',
            latestSupportedMinimalVersion: '23.08.80308.minimal'
          },
          responseMessages: []
        },
        refetch: jest.fn(),
        loading: false,
        error: null
      } as any)

      const { container } = render(
        <TestWrapper>
          <ModuleVersionTable />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()

      expect(container.querySelector('[data-testid="release-note-table"]')).not.toBeNull()
      expect(container.querySelector('[data-testid="release-note-table-head"]')).not.toBeNull()
      expect(container.querySelector('[data-testid="name"]')).not.toBeNull()
      expect(container.querySelector('[data-testid="version"]')).not.toBeNull()
      expect(container.querySelector('[data-testid="updated"]')).not.toBeNull()
      expect(container.querySelector('[data-testid="link"]')).not.toBeNull()
    })

    test('module version table not showing up', async () => {
      jest.spyOn(cdNgOpenApiServices, 'useListModuleVersions').mockReturnValue({
        refetch: jest.fn()
      } as any)
      const { container } = render(
        <TestWrapper>
          <ModuleVersionTable />
        </TestWrapper>
      )
      jest.spyOn(cdNGSVC, 'usePublishedDelegateVersion').mockReturnValue({
        data: {
          metaData: {},
          resource: {
            latestSupportedVersion: '23.08.80308',
            latestSupportedMinimalVersion: '23.08.80308.minimal'
          },
          responseMessages: []
        },
        refetch: jest.fn(),
        loading: false,
        error: null
      } as any)

      expect(container).toMatchSnapshot()

      expect(container.querySelector('[data-testid="name"]')).toBeNull()
      expect(container.querySelector('[data-testid="version"]')).toBeNull()
      expect(container.querySelector('[data-testid="updated"]')).toBeNull()
      expect(container.querySelector('[data-testid="link"]')).toBeNull()
    })
  })
})
