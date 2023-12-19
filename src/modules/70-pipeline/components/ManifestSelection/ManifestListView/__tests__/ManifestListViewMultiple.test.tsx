import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'

import ManifestListView from '../ManifestListViewMultiple'
import { manifestsDefaultProps } from './mock'
import { ManifestListViewProps } from '../../ManifestInterface'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
const fetchConnectors = (): Promise<unknown> => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  })
}))

const props = {
  ...manifestsDefaultProps,
  updateManifestList: jest.fn(),
  removeValuesYaml: jest.fn(),
  removeManifestConfig: jest.fn(),
  attachPathYaml: jest.fn()
}

describe('Manifests List view tests', () => {
  test(`renders without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <ManifestListView {...(props as ManifestListViewProps)} deploymentType={'Kubernetes'} />
      </TestWrapper>
    )
    const editButtons = container.querySelectorAll('[data-icon="Edit"]')
    expect(editButtons).toHaveLength(4)
    const functionDefinitionManifestEditButton = editButtons[0]
    expect(functionDefinitionManifestEditButton).toBeInTheDocument()
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)
    await userEvent.click(functionDefinitionManifestEditButton)
    expect(modals.length).toBe(1)
    const manifestModal = modals[0]! as HTMLElement
    const identifierField = queryByNameAttribute('identifier', manifestModal)
    expect(identifierField).toBeInTheDocument()
    expect(identifierField).toHaveValue('id1')
    const branchField = queryByNameAttribute('branch', manifestModal)
    expect(branchField).toBeInTheDocument()
    expect(branchField).toHaveValue('b1')
    const path1 = queryByNameAttribute('paths[0].path', manifestModal)
    expect(path1).toBeInTheDocument()
    expect(path1).toHaveValue('f1')
  })
})
