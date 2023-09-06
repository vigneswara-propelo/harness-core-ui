/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { FILE_VIEW_TAB, FileStoreNodeTypes } from '@platform/filestore/interfaces/FileStore'
import { getDummyFileStoreContextValueWithFolderChildren } from '@platform/filestore/components/FileStoreContext/__tests__/mock'
import { FileStoreContext } from '@platform/filestore/components/FileStoreContext/FileStoreContext'
import { referencedByResponse } from '../../FileView/ReferencedBy/__tests__/mock'
import StoreView from '../StoreView'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  getNode: jest.fn(),
  useGetReferencedBy: jest.fn().mockImplementation(() => ({ data: referencedByResponse, loading: false }))
}))

const mockContext = getDummyFileStoreContextValueWithFolderChildren()

describe('StoreView', () => {
  test('should render StoreView component', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider value={mockContext}>
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <StoreView />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )

    //search a file in the store view
    const file = getByText('asd12')
    expect(file).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
  test('should render PageSpinner durring loading page', async () => {
    render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider
          value={{
            ...mockContext,
            loading: true,
            activeTab: FILE_VIEW_TAB.REFERENCED_BY
          }}
        >
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <StoreView />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const pageSpinner = document.querySelectorAll('.PageSpinner--spinner')
    expect(pageSpinner.length).toEqual(1)
  })
  test('should render ModalView', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider
          value={{
            ...mockContext,
            isModalView: true,
            activeTab: FILE_VIEW_TAB.REFERENCED_BY,
            currentNode: { ...mockContext.currentNode, type: FileStoreNodeTypes.FILE }
          }}
        >
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <StoreView />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    const referencedByContentArray = referencedByResponse.data.content
    expect(getByText(referencedByContentArray[0].referredByEntity.name)).toBeInTheDocument()
  })

  test('should render EmptyView', async () => {
    const { getByText } = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'dummy' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <FileStoreContext.Provider
          value={{
            ...mockContext,
            closedNode: 'test',
            currentNode: { ...mockContext.currentNode, children: [] }
          }}
        >
          <Formik formName="test" initialValues={{ test: [] }} onSubmit={Promise.resolve}>
            <StoreView />
          </Formik>
        </FileStoreContext.Provider>
      </TestWrapper>
    )
    expect(getByText('platform.filestore.noFilesInFolderTitle')).toBeInTheDocument()
  })
})
