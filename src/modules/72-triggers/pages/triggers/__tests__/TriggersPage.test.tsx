/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, screen, queryByText, getByText as globalGetByText } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import {
  findDialogContainer,
  findPopoverContainer,
  findDrawerContainer,
  TestWrapper,
  findTransitionContainer
} from '@common/utils/testUtils'
import type { GetTriggerListForTargetQueryParams } from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { pipelinePathProps } from '@common/utils/routeUtils'
import * as useIsTriggerCreatePermission from '@triggers/components/Triggers/useIsTriggerCreatePermission'
import { PreferenceStoreProvider } from 'framework/PreferenceStore/PreferenceStoreContext'
import { GetTriggerResponse, triggersCatalogResponse } from './webhookMockResponses'
import { GetTriggerListForTargetResponse } from './sharedMockResponses'
import { PipelineResponse as PipelineDetailsMockResponse } from './PipelineDetailsMocks'
import TriggersPage from '../TriggersPage'

const mockDelete = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockUpdateTrigger = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockCopy = jest.fn()
const mockGetTriggersFunction = jest.fn()
const fetchTriggerList = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useGetTriggerListForTarget: jest.fn(args => {
    mockGetTriggersFunction(args)
    return { ...GetTriggerListForTargetResponse, refetch: fetchTriggerList }
  }),
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useDeleteTrigger: jest.fn().mockImplementation(() => ({ mutate: mockDelete })),
  useUpdateTrigger: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTrigger })),
  useGetTriggerCatalog: jest.fn(() => ({ data: triggersCatalogResponse, loading: false }))
}))

jest.mock('services/pipeline-rq', () => ({
  useGetPipelineSummaryQuery: jest.fn(() => PipelineDetailsMockResponse)
}))

jest.mock('clipboard-copy', () => (args: string) => mockCopy(args))

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: {
  queryParams?: Pick<GetTriggerListForTargetQueryParams, 'searchTerm'>
}): JSX.Element {
  return (
    <TestWrapper
      path={routes.toTriggersPage({ ...pipelinePathProps, module: ':module' })}
      pathParams={{
        projectIdentifier: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier',
        accountId: 'accountId',
        pipelineIdentifier: 'pipelineIdentifier',
        module: 'cd'
      }}
      queryParams={props.queryParams}
    >
      <PreferenceStoreProvider>
        <TriggersPage />
      </PreferenceStoreProvider>
    </TestWrapper>
  )
}

const getCopyTestId = (identifier: string): string => `${identifier}-copy`
const getCopyAsUrlTestId = (identifier: string): string => `${identifier}-copyAsUrl`
const getCopyAsCurlTestId = (identifier: string): string => `${identifier}-copyAsCurl`
const getEnabledTestId = (identifier: string): string => `${identifier}-enabled`
const getMoreTestId = (identifier: string): string => `${identifier}-more-button`
const getEditTestId = (identifier: string): string => `${identifier}-edit-button`
const getDeleteTestId = (identifier: string): string => `${identifier}-delete-button`

const changeSortFilter = async (filter: string, sort: string[]): Promise<void> => {
  const sortDropdown = screen.queryAllByTestId('dropdown-button')[0]
  await waitFor(() => expect(sortDropdown).toBeInTheDocument())

  // Sort by date created asc
  fireEvent.click(sortDropdown!)
  const popover = findPopoverContainer()
  await waitFor(() => expect(popover).toBeInTheDocument())

  fireEvent.click(queryByText(popover!, filter)!)

  await waitFor(() => expect(screen.getByText(filter)).toBeInTheDocument())

  expect(mockGetTriggersFunction).toBeCalledWith({
    queryParams: {
      accountIdentifier: 'accountId',
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      targetIdentifier: 'pipelineIdentifier',
      searchTerm: undefined,
      page: '0',
      size: 20,
      sort
    },
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })
}

describe('TriggersPage Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Shows Trigger List', async () => {
      const { getByText, getByPlaceholderText } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())

      // Check for trigger page header
      expect(getByText('triggers.newTrigger')).toBeInTheDocument()
      expect(getByPlaceholderText('search')).toBeInTheDocument()
      expect(getByText('Total: 4')).toBeInTheDocument()
      expect(getByText('Newest')).toBeInTheDocument()

      // Check for trigger table header
      expect(getByText('COMMON.TRIGGERLABEL')).toBeInTheDocument()
      expect(getByText('STATUS')).toBeInTheDocument()
      expect(getByText('ACTIVITY')).toBeInTheDocument()
      expect(getByText('triggers.lastActivationLabel')).toBeInTheDocument()
      expect(getByText('EXECUTION.TRIGGERTYPE.WEBHOOK')).toBeInTheDocument()
      expect(getByText('ENABLEDLABEL')).toBeInTheDocument()

      // Check for the triggers in the table
      expect(getByText('Webhook Custom')).toBeInTheDocument()
      expect(getByText('Webhook GITHUB')).toBeInTheDocument()
      expect(getByText('trigger-2')).toBeInTheDocument()
      expect(getByText('testcustomtrigger1')).toBeInTheDocument()
      expect(getByText('4 of 4')).toBeInTheDocument()
    })
    test('Initial Render - New Triggers Drawer', async () => {
      const { getByText } = render(
        <TestWrapper>
          <TriggersPage />
        </TestWrapper>
      )
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())

      const addTriggerButton = getByText('triggers.newTrigger')

      if (!addTriggerButton) {
        throw Error('No action button')
      }

      fireEvent.click(addTriggerButton)

      // Check for trigger in the Trigger Catalog Drawer
      expect(screen.getAllByText('common.triggersLabel')).toHaveLength(2)
      expect(screen.getByText('execution.triggerType.WEBHOOK')).toBeInTheDocument()
      expect(screen.getByText('common.repo_provider.githubLabel')).toBeInTheDocument()
      expect(screen.getByText('common.repo_provider.gitlabLabel')).toBeInTheDocument()
      expect(screen.getByText('pipeline.artifactTriggerConfigPanel.artifact')).toBeInTheDocument()
      expect(screen.getByText('platform.connectors.GCR.name')).toBeInTheDocument()
      expect(screen.getByText('platform.connectors.ECR.name')).toBeInTheDocument()
      expect(screen.getByText('manifestsText')).toBeInTheDocument()
      expect(screen.getByText('common.HelmChartLabel')).toBeInTheDocument()
      expect(screen.getByText('triggers.scheduledLabel')).toBeInTheDocument()
      expect(screen.getByText('triggers.cronLabel')).toBeInTheDocument()
    })
  })
  describe('Interactivity', () => {
    const triggerIdentifier = 'WebhookCustom'
    jest.spyOn(useIsTriggerCreatePermission, 'useIsTriggerCreatePermission').mockImplementation(() => true)

    test('Add a trigger redirects to Trigger Wizard', async () => {
      const { getByTestId, getByText } = render(<WrapperComponent />)
      fireEvent.click(getByText('triggers.newTrigger'))

      const triggerDrawer = findDrawerContainer()
      await waitFor(() => expect(triggerDrawer).toBeInTheDocument())
      fireEvent.click(getByText('common.repo_provider.githubLabel'))

      await waitFor(() =>
        expect(getByTestId('location')).toMatchInlineSnapshot(`
            <div
              data-testid="location"
            >
              /account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/triggers/new?triggerType=Webhook&sourceRepo=Github
            </div>
        `)
      )
    })

    test('Edit a trigger redirects to Trigger Wizard', async () => {
      const { getByTestId } = render(<WrapperComponent />)
      const moreButton = getByTestId(getMoreTestId(triggerIdentifier))
      await waitFor(() => expect(moreButton).toBeInTheDocument())

      // Edit button
      fireEvent.click(moreButton)
      const moreOptionPopover = findPopoverContainer()
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getEditTestId(triggerIdentifier)))

      await waitFor(() =>
        expect(getByTestId('location')).toMatchInlineSnapshot(`
            <div
              data-testid="location"
            >
              /account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/triggers/${triggerIdentifier}
            </div>
         `)
      )
    })

    test('Disable a trigger', async () => {
      const { getByTestId } = render(<WrapperComponent />)

      // Click disable button
      const toggleButton = getByTestId(getEnabledTestId(triggerIdentifier))
      await waitFor(() => expect(toggleButton).toBeInTheDocument())
      expect(toggleButton).toBeChecked()
      fireEvent.click(toggleButton)

      expect(mockUpdateTrigger).toBeCalledWith(
        `trigger:\n  name: Webhook Custom\n  identifier: ${triggerIdentifier}\n  enabled: false\n  description: ""\n  tags: {}\n  stagesToExecute: []\n  orgIdentifier: default\n  projectIdentifier: Pankaj\n  pipelineIdentifier: dockerdigestissue\n  source:\n    type: Webhook\n    spec:\n      type: Custom\n      spec:\n        payloadConditions: []\n        headerConditions: []\n  inputSetRefs:\n    - Input_Set_1\n`
      )
    })

    test('Enable a trigger', async () => {
      const identifier = 'trigger2'
      const { getByTestId } = render(<WrapperComponent />)

      // Click disable button
      const toggleButton = getByTestId(getEnabledTestId(identifier))
      await waitFor(() => expect(toggleButton).toBeInTheDocument())
      expect(toggleButton).not.toBeChecked()
      fireEvent.click(toggleButton)

      expect(mockUpdateTrigger).toBeCalledWith(
        'trigger:\n  name: trigger-2\n  identifier: trigger2\n  enabled: true\n  description: ""\n  tags: {}\n  stagesToExecute: []\n  orgIdentifier: default\n  projectIdentifier: Pankaj\n  pipelineIdentifier: dockerdigestissue\n  source:\n    type: Webhook\n    spec:\n      type: Custom\n      spec:\n        payloadConditions: []\n        headerConditions: []\n  inputSetRefs:\n    - Input_Set_1\n'
      )
    })

    test('Delete a trigger', async () => {
      const { getByTestId } = render(<WrapperComponent />)
      const moreButton = getByTestId(getMoreTestId(triggerIdentifier))
      await waitFor(() => expect(moreButton).toBeInTheDocument())

      // Delete button
      fireEvent.click(moreButton)
      const moreOptionPopover = findPopoverContainer()
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getDeleteTestId(triggerIdentifier)))

      // Delete Dialog Container
      const deleteConfirmationDialog = findDialogContainer() as HTMLDivElement
      await waitFor(() => expect(deleteConfirmationDialog).toBeInTheDocument())
      const confirmDeleteButton = globalGetByText(deleteConfirmationDialog, 'delete')
      if (!confirmDeleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(confirmDeleteButton)

      expect(mockDelete).toBeCalledWith(triggerIdentifier, { headers: { 'content-type': 'application/json' } })
    })

    test('Copy Webhook URL & cURL Command', async () => {
      const { getByTestId } = render(<WrapperComponent />)
      const copyButton = getByTestId(getCopyTestId(triggerIdentifier))
      await waitFor(() => expect(copyButton).toBeInTheDocument())

      // Copy Webhook URL
      fireEvent.click(copyButton!)
      const transitionContainer = findTransitionContainer()
      await waitFor(() => expect(transitionContainer).toBeInTheDocument())
      fireEvent.click(getByTestId(getCopyAsUrlTestId(triggerIdentifier)))
      expect(mockCopy).toHaveBeenCalledWith('webhookUrl')

      // Copy cURL Command
      fireEvent.click(copyButton!)
      await waitFor(() => expect(transitionContainer).toBeInTheDocument())
      fireEvent.click(getByTestId(getCopyAsCurlTestId(triggerIdentifier)))
      expect(mockCopy).toHaveBeenCalledWith('webhookCurlCommand')
    })

    test('Sort the trigger', async () => {
      render(<WrapperComponent />)

      expect(await screen.findByText('triggers.newTrigger')).toBeInTheDocument()

      // Sort by date created ASC
      await changeSortFilter('Oldest', ['createdAt,ASC'])

      // Sort by date created DESC
      await changeSortFilter('Newest', ['createdAt,DESC'])

      // Sort by Name ASC
      await changeSortFilter('Name (A->Z, 0->9)', ['name,ASC'])

      // Sort by Name DESC
      await changeSortFilter('Name (Z->A, 9->0)', ['name,DESC'])
    })

    test('New Trigger, Copy URL, Toggle, Edit & Delete Button should be disabled if user does not have the required permission', async () => {
      const setOptionsOpen = jest.fn()
      const goToEditWizard = jest.fn()
      const confirmDelete = jest.fn()
      jest.mock('@harness/uicore', () => ({
        ...jest.requireActual('@harness/uicore'),
        useConfirmationDialog: jest.fn().mockImplementation(() => ({
          openDialog: confirmDelete,
          closeDialog: jest.fn()
        }))
      }))

      jest.spyOn(useIsTriggerCreatePermission, 'useIsTriggerCreatePermission').mockImplementation(() => false)

      const { getByText: _getByText, getByTestId } = render(<WrapperComponent />)
      const copyButton = getByTestId(getCopyTestId(triggerIdentifier))
      await waitFor(() => expect(copyButton).toBeInTheDocument())

      // New Trigger Button
      expect(_getByText('triggers.newTrigger').closest('button')).toBeDisabled()

      // Copy Url Icon
      fireEvent.click(getByTestId(getCopyTestId(triggerIdentifier)))
      expect(setOptionsOpen).not.toBeCalled()

      // Enabled toggle
      expect(getByTestId(getEnabledTestId(triggerIdentifier))).toBeDisabled()

      // Edit button
      fireEvent.click(getByTestId(getMoreTestId(triggerIdentifier)))
      const moreOptionPopover = findPopoverContainer()
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getEditTestId(triggerIdentifier)))
      expect(goToEditWizard).not.toBeCalled()

      // Delete button
      fireEvent.click(getByTestId(getMoreTestId(triggerIdentifier)))
      await waitFor(() => expect(moreOptionPopover).toBeInTheDocument())
      fireEvent.click(getByTestId(getDeleteTestId(triggerIdentifier)))
      expect(confirmDelete).not.toBeCalled()
    })
  })

  test('Triggers List should update every minutes', async () => {
    jest.useFakeTimers()
    render(<WrapperComponent />)
    jest.advanceTimersByTime(60 * 1000)

    expect(fetchTriggerList).toHaveBeenCalled()
  })
})
