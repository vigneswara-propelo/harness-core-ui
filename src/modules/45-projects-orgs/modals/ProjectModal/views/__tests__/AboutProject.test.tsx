/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'

import { render, queryByText, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import type { Project, ResponsePageOrganizationResponse } from 'services/cd-ng'
import { TestWrapper, UseGetMockData } from '@common/utils/testUtils'
import { clickSubmit, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { createMockData, editMockData, editOrgMockData, projectMockData } from './mockData'
import { orgMockData } from './OrgMockData'
import StepProject from '../StepAboutProject'
import EditProject from '../EditProject'

const project: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

jest.mock('services/cd-ng', () => ({
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutProject: jest.fn().mockImplementation(() => editMockData),
  usePostProject: jest.fn().mockImplementation(() => createMockData),
  useGetOrganizationList: jest.fn().mockImplementation(() => {
    return { ...orgMockData, refetch: jest.fn(), error: null }
  }),
  useGetOrganization: jest.fn().mockImplementation(() => {
    return { ...editOrgMockData, refetch: jest.fn(), error: null }
  }),
  useGetProject: jest.fn().mockImplementation(() => {
    return { ...projectMockData, refetch: jest.fn(), error: null }
  })
}))

describe('About Project test', () => {
  test('create project ', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <StepProject
          orgMockData={orgMockData as UseGetMockData<ResponsePageOrganizationResponse>}
          createMock={createMockData}
        />
      </TestWrapper>
    )
    expect(queryByText(container, 'projectsOrgs.aboutProject')).toBeDefined()
    expect(container).toMatchSnapshot()
    setFieldValue({ type: InputTypes.TEXTFIELD, container: container, fieldId: 'name', value: 'dummy name' })
    fireEvent.click(getByTestId('description-edit'))
    setFieldValue({
      type: InputTypes.TEXTAREA,
      container: container,
      fieldId: 'description',
      value: ' This is new description'
    })
    clickSubmit(container)
    expect(container).toMatchSnapshot()
  }),
    test('edit project ', async () => {
      const { container } = render(
        <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
          <EditProject identifier={project.identifier} orgIdentifier={project.orgIdentifier} />
        </TestWrapper>
      )
      expect(queryByText(container, 'projectsOrgs.projectEdit')).toBeDefined()
      expect(container).toMatchSnapshot()
      setFieldValue({ type: InputTypes.TEXTFIELD, container: container, fieldId: 'name', value: 'dummy name_updated' })
      await act(async () => {
        clickSubmit(container)
      })
      expect(container).toMatchSnapshot()
    })
})
