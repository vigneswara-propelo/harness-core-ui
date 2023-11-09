import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { clickSubmit, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { orgMockData } from './OrgMockData'
import { createMockData, editMockData, editOrgMockData, projectMockData } from './mockData'
import ProjectForm from '../ProjectForm'

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
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: () => ({ identifyUser: jest.fn(), trackEvent: trackEventMock })
}))
const onComplete = jest.fn()
const trackEventMock = jest.fn()

const editProjectData = {
  orgIdentifier: 'testOrg',
  identifier: 'testProject1234',
  name: 'testProject1234',
  color: '#0063f7',
  modules: [],
  description: 'this is description',
  tags: { abc: 'def' }
}

describe('Project Flow tests', () => {
  beforeEach(jest.clearAllMocks)

  test('Create project ', async () => {
    const { container, queryByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <ProjectForm
          disableSelect={false}
          enableEdit={true}
          disableSubmit={false}
          onComplete={onComplete}
          initialOrgIdentifier="testOrg"
          title={'projectsOrgs.projectEdit'}
          saveTitle={'save'}
          organizationItems={[]}
          setModalErrorHandler={jest.fn()}
        />
      </TestWrapper>
    )
    const projectName = container.querySelector('input[name="name"]') as HTMLInputElement
    const orgField = container.querySelector('input[name="orgIdentifier"]') as HTMLInputElement

    expect(projectName).toHaveValue('')
    expect(orgField).toHaveValue('')

    setFieldValue({ type: InputTypes.TEXTFIELD, container: container, fieldId: 'name', value: '' })

    await act(async () => {
      clickSubmit(container)
    })
    expect(queryByText('common.validation.nameIsRequired')).toBeInTheDocument()

    setFieldValue({ type: InputTypes.TEXTFIELD, container: container, fieldId: 'name', value: 'testProject' })
    expect(document.querySelector('div[class*="InputWithIdentifier--idValue"]')).toHaveTextContent('testProject')

    await act(async () => {
      clickSubmit(container)
    })
    expect(queryByText('common.validation.nameIsRequired')).toBeNull()

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        color: '#0063f7',
        description: '',
        identifier: 'testProject',
        modules: undefined,
        name: 'testProject',
        orgIdentifier: 'testOrg',
        tags: {}
      })
    })
  })
  test('Edit project ', async () => {
    const { container, queryByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <ProjectForm
          data={{ ...editProjectData }}
          disableSelect={true}
          enableEdit={false}
          disableSubmit={false}
          onComplete={onComplete}
          initialOrgIdentifier="testOrg"
          title={'projectsOrgs.projectEdit'}
          saveTitle={'save'}
          organizationItems={[]}
          setModalErrorHandler={jest.fn()}
        />
      </TestWrapper>
    )
    const projectName = queryByText('testProject1234')
    const description = queryByText('this is description')
    const orgField = container.querySelector('input[name="orgIdentifier"]') as HTMLInputElement

    expect(description).toBeInTheDocument()
    expect(projectName).toBeInTheDocument()
    expect(orgField).toBeInTheDocument()
    setFieldValue({ type: InputTypes.TEXTFIELD, container: container, fieldId: 'name', value: 'updatedTestProject' })
    await act(async () => {
      clickSubmit(container)
    })
    // identifier remains same only the name is updated.
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith({
        color: '#0063f7',
        description: 'this is description',
        identifier: 'testProject1234',
        name: 'updatedTestProject',
        orgIdentifier: 'testOrg',
        modules: [],
        tags: { abc: 'def' }
      })
    })
  })
})
