/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, screen, render, waitFor } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { gitConnectorMock, mockBranches, mockRepos } from '@gitsync/components/GitSyncForm/__tests__/mockdata'
import { GitSyncFormFields } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { StringsContext } from 'framework/strings/StringsContext'
import { NewInfrastructureForm } from '../NewInfrastructureForm'
import { CombinedInfrastructureDefinationResponse } from '../BootstrapDeployInfraDefinition'

const getGitConnector = jest.fn(() => Promise.resolve(gitConnectorMock))
const fetchRepos = jest.fn(() => Promise.resolve(mockRepos))
const fetchBranches = jest.fn(() => Promise.resolve(mockBranches))
const fetchSupportedConnectorsList = jest.fn(_arg => Promise.resolve(gitConnectorMock))

jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(arg => fetchSupportedConnectorsList(arg)),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: gitConnectorMock.data.content[1] }, refetch: getGitConnector, loading: false }
  }),
  useGetListOfReposByRefConnector: jest.fn().mockImplementation(() => {
    return { data: mockRepos, refetch: fetchRepos, loading: false }
  }),
  useGetListOfBranchesByRefConnectorV2: jest.fn().mockImplementation(() => {
    return { data: mockBranches, refetch: fetchBranches }
  }),
  useGetSettingsList: jest.fn().mockImplementation(() => {
    return { data: { data: [] } }
  }),
  validateRepoPromise: jest.fn().mockImplementation(() => {
    return { data: { isValid: true } }
  })
}))

describe('NewInfrastructureForm test', () => {
  afterEach(() => {
    fetchRepos.mockReset()
    fetchBranches.mockReset()
    fetchSupportedConnectorsList.mockReset()
  })

  test('Inline Remote option should not be availble while creating if gitX is not supported', async () => {
    render(
      <StringsContext.Provider value={{ data: {} as any, getString: (key: string) => key as string }}>
        <Formik<Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields>
          formName="newInfrastructureForm"
          initialValues={{}}
          onSubmit={() => undefined}
        >
          {formikProps => (
            <NewInfrastructureForm
              isGitXEnabledForInfras={false}
              formikProps={formikProps}
              isEdit={false}
              isReadOnly={false}
            />
          )}
        </Formik>
      </StringsContext.Provider>
    )

    expect(screen.queryByText('common.git.inlineStoreLabel')).not.toBeInTheDocument()
    expect(screen.queryByText('common.git.remoteStoreLabel')).not.toBeInTheDocument()
  })

  test('Inline Remote option should be enabled while creating if gitX is supported', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ accountId: 'testAcc', projectIdentifier: 'testProj', orgIdentifier: 'default' }}>
        <StringsContext.Provider value={{ data: {} as any, getString: (key: string) => key as string }}>
          <Formik<Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields>
            initialValues={{}}
            onSubmit={() => undefined}
            formName="newEditInfrastructureForm"
          >
            {formikProps => (
              <NewInfrastructureForm
                isGitXEnabledForInfras={true}
                formikProps={formikProps}
                isEdit={false}
                isReadOnly={false}
              />
            )}
          </Formik>
        </StringsContext.Provider>
      </TestWrapper>
    )

    waitFor(() => expect(screen.queryByText('cd.infrastructure.chooseInfrastructureSetupHeader')).toBeInTheDocument())

    expect(screen.queryByText('common.git.inlineStoreLabel')).toBeInTheDocument()
    expect(screen.queryByText('common.git.remoteStoreLabel')).toBeInTheDocument()
    const inlineStoreTypeCard = container.querySelector('.infraCardWrapper > div[data-index="0"]')
    const remoteStoreTypeCard = container.querySelector('.infraCardWrapper > div[data-index="1"]')
    expect(inlineStoreTypeCard?.classList.contains('Card--interactive')).toBe(true)
    expect(inlineStoreTypeCard?.classList.contains('Card--selected')).toBe(true)
    expect(remoteStoreTypeCard?.classList.contains('Card--selected')).toBe(false)
    expect(remoteStoreTypeCard?.classList.contains('Card--interactive')).toBe(true)
    // Storetype onChange should change storeType while creating
    act(() => {
      fireEvent.click(remoteStoreTypeCard!)
    })
    expect(remoteStoreTypeCard?.classList.contains('Card--selected')).toBe(true)
  })

  test('Inline should be selected and Remote option disabled while editing for Inline infra', async () => {
    const { container } = render(
      <StringsContext.Provider value={{ data: {} as any, getString: (key: string) => key as string }}>
        <Formik<Partial<CombinedInfrastructureDefinationResponse> & GitSyncFormFields>
          initialValues={{ identifier: 'testInfras', storeType: 'INLINE' }}
          onSubmit={() => undefined}
          formName="newEditEnvironmentForm"
        >
          {formikProps => (
            <NewInfrastructureForm
              isGitXEnabledForInfras={true}
              formikProps={formikProps}
              isEdit={true}
              isReadOnly={false}
            />
          )}
        </Formik>
      </StringsContext.Provider>
    )
    waitFor(() => expect(screen.queryByText('cd.infrastructure.chooseInfrastructureSetupHeader')).toBeInTheDocument())

    expect(screen.queryByText('common.git.inlineStoreLabel')).toBeInTheDocument()
    expect(screen.queryByText('common.git.remoteStoreLabel')).toBeInTheDocument()
    const inlineStoreTypeCard = container.querySelector('.infraCardWrapper > div[data-index="0"]')
    const remoteStoreTypeCard = container.querySelector('.infraCardWrapper > div[data-index="1"]')
    expect(inlineStoreTypeCard?.classList.contains('Card--interactive')).toBe(true)
    expect(inlineStoreTypeCard?.classList.contains('Card--selected')).toBe(true)
    expect(remoteStoreTypeCard?.classList.contains('Card--selected')).toBe(false)
    expect(remoteStoreTypeCard?.classList.contains('Card--interactive')).toBe(false)
    expect(remoteStoreTypeCard?.classList.contains('Card--disabled')).toBe(true)
    // Storetype onChange should not change storeType while editing
    act(() => {
      fireEvent.click(remoteStoreTypeCard!)
    })

    expect(remoteStoreTypeCard?.classList.contains('Card--selected')).toBe(false)
  })
})
