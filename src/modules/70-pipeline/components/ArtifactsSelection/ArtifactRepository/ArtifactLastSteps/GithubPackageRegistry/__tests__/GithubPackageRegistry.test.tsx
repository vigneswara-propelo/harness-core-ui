/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE, StepProps } from '@harness/uicore'
import * as cdng from 'services/cd-ng'
import { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import {
  ArtifactType,
  TagTypes,
  GithubPackageRegistryInitialValuesType,
  GithubPackageRegistryProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { GithubPackageRegistryWithRef } from '../GithubPackageRegistry'

const fetchPackagesMock = jest.fn()

const MockRef = React.createRef<any>()

const PackagesMockData = {
  githubPackageResponse: [
    {
      packageId: '1707838',
      packageName: 'helloworld',
      packageType: 'container',
      visibility: 'private',
      packageUrl: 'https://github.com/users/vtxorxwitty/packages/container/package/helloworld'
    }
  ]
}
const VersionsMockData = [
  {
    number: 'v1',
    revision: null,
    description: null,
    artifactPath: 'ghcr.io/vtxorxwitty/img:v1',
    buildUrl: 'https://github.com/users/vtxorxwitty/packages/container/img/35123272',
    buildDisplayName: 'img: v1',
    buildFullDisplayName: 'sha256:339927fad2a0db896f3580011d9341f8c3896b109fb7da6db23183f37cbe99f4',
    artifactFileSize: null,
    uiDisplayName: 'Tag# v1',
    updateTime: null,
    status: 'SUCCESS',
    buildParameters: {},
    metadata: {
      v1: 'img'
    },
    labels: {},
    artifactFileMetadataList: []
  }
]

const commonInitialValues: GithubPackageRegistryInitialValuesType = {
  identifier: '',
  versionType: TagTypes.Value,
  spec: {
    connectorRef: '',
    packageType: '',
    org: '',
    packageName: '',
    version: '',
    versionRegex: ''
  }
}

const onSubmit = jest.fn()
export const props: Omit<StepProps<cdng.ConnectorConfigDTO> & GithubPackageRegistryProps, 'initialValues'> = {
  key: 'key',
  name: 'Artifact details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  context: 1,
  handleSubmit: onSubmit,
  artifactIdentifiers: [],
  selectedArtifact: 'GithubPackageRegistry' as ArtifactType,
  prevStepData: {
    connectorId: {
      value: 'testConnector'
    }
  }
}

const doConfigureOptionsTesting = async (cogModal: HTMLElement, fieldElement: HTMLInputElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  await userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  act(() => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  const cogSubmit = getElementByText(cogModal, 'submit')
  await userEvent.click(cogSubmit)
  await waitFor(() => expect(fieldElement.value).toBe('<+input>.regex(<+input>.includes(/test/))'))
}

describe('GithubPackageRegistry tests', () => {
  beforeEach(() => {
    onSubmit.mockReset()
  })
  afterAll(() => {
    jest.clearAllMocks()
  })

  test(`renders fine for the NEW artifact`, () => {
    jest.spyOn(cdng, 'useGetPackagesFromGithub').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: PackagesMockData,
          metaData: null,
          correlationId: 'ede8ab54-e8b6-4ac1-a9f0-1b42b0c9f8b7'
        },
        refetch: fetchPackagesMock,
        error: null,
        loading: false
      }
    })
    jest.spyOn(cdng, 'useGetVersionsFromPackages').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: VersionsMockData,
          metaData: null,
          correlationId: '14aeac24-a895-4739-9deb-4c32ee0cea5a'
        },
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef ref={MockRef} initialValues={commonInitialValues} {...props} />
      </TestWrapper>
    )
    expect(queryByNameAttribute('spec.packageType', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.org', container)).not.toBeNull()
    const packageNameInput = queryByNameAttribute('spec.packageName', container) as HTMLElement
    expect(packageNameInput).not.toBeNull()
    expect(queryByNameAttribute('spec.version', container)).not.toBeNull()
  })

  test(`renders fine for the NEW artifact when view context is sidecar`, () => {
    jest.spyOn(cdng, 'useGetPackagesFromGithub').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: {},
          metaData: null,
          correlationId: 'ede8ab54-e8b6-4ac1-a9f0-1b42b0c9f8b7'
        },
        refetch: fetchPackagesMock,
        error: null,
        loading: false
      }
    })
    jest.spyOn(cdng, 'useGetVersionsFromPackages').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          metaData: null,
          correlationId: '14aeac24-a895-4739-9deb-4c32ee0cea5a'
        },
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef
          ref={MockRef}
          initialValues={commonInitialValues}
          {...props}
          context={ModalViewFor.SIDECAR}
        />
      </TestWrapper>
    )
    expect(queryByNameAttribute('spec.packageType', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.org', container)).not.toBeNull()
    const packageNameInput = queryByNameAttribute('spec.packageName', container) as HTMLElement
    expect(packageNameInput).not.toBeNull()
    expect(queryByNameAttribute('spec.version', container)).not.toBeNull()
  })

  test(`renders fine for the versionType as value`, async () => {
    jest.spyOn(cdng, 'useGetPackagesFromGithub').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          metaData: null,
          correlationId: 'ede8ab54-e8b6-4ac1-a9f0-1b42b0c9f8b7'
        },
        refetch: fetchPackagesMock,
        error: null,
        loading: false
      }
    })
    jest.spyOn(cdng, 'useGetVersionsFromPackages').mockImplementation((): any => {
      return { refetch: jest.fn(), error: null, loading: false }
    })
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Value,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'container',
        org: 'testOrg',
        packageName: 'testPackage',
        version: 'xyz.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef ref={MockRef} initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    expect(queryByNameAttribute('spec.packageType', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.org', container)).not.toBeNull()
    const packageNameInput = queryByNameAttribute('spec.packageName', container) as HTMLElement
    expect(packageNameInput).not.toBeNull()
    expect(queryByNameAttribute('spec.version', container)).not.toBeNull()

    fireEvent.change(packageNameInput, { target: { value: 'testPackageName' } })
    packageNameInput.focus()
    fireEvent.focus(packageNameInput)

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(fetchPackagesMock).toHaveBeenCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'container',
          org: 'testOrg',
          packageName: 'testPackage',
          version: 'xyz.zip'
        }
      })
    })
  })

  test(`renders fine for sidecar artifact when package type is Nuget`, async () => {
    jest.spyOn(cdng, 'useGetPackagesFromGithub').mockImplementation((): any => {
      return { refetch: fetchPackagesMock, error: null, loading: false }
    })
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      identifier: 'initial_id',
      versionType: TagTypes.Value,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'Nuget',
        org: 'testOrg',
        packageName: 'testPackage',
        version: 'xyz.zip',
        digest: 'test'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef
          ref={MockRef}
          initialValues={initialValues as any}
          {...props}
          isMultiArtifactSource={true}
        />
      </TestWrapper>
    )

    const identifierField = queryByNameAttribute('identifier', container) as HTMLInputElement
    expect(identifierField.value).toBe('initial_id')
    // change value of identifier to empty
    act(() => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: '' } })
    })

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)

    // change value of identifier
    act(() => {
      fireEvent.change(queryByNameAttribute('identifier', container)!, { target: { value: 'test_id' } })
    })

    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        identifier: 'test_id',
        spec: {
          connectorRef: 'testConnector',
          packageType: 'Nuget',
          org: 'testOrg',
          packageName: 'testPackage',
          version: 'xyz.zip',
          digest: 'test'
        }
      })
    })
  })

  test(`renders fine for the versionType as regex`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'container',
        org: 'testOrg',
        packageName: 'testPackage',
        versionRegex: '*.zip'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef ref={MockRef} initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    expect(queryByNameAttribute('spec.packageType', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.org', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.packageName', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.versionRegex', container)).not.toBeNull()

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'container',
          org: 'testOrg',
          packageName: 'testPackage',
          versionRegex: '*.zip'
        }
      })
    })
  })

  test(`renders fine when selected deployment type is ssh and package type is maven`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'maven',
        org: 'testOrg',
        packageName: 'testPackage',
        versionRegex: '*.zip',
        groupId: 'test group',
        artifactId: 'test artifact',
        extension: 'test extension'
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef
          ref={MockRef}
          initialValues={initialValues as any}
          {...props}
          selectedDeploymentType={ServiceDeploymentType.Ssh}
        />
      </TestWrapper>
    )

    expect(queryByNameAttribute('spec.packageType', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.org', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.packageName', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.versionRegex', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.groupId', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.artifactId', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.extension', container)).not.toBeNull()

    fireEvent.change(queryByNameAttribute('spec.org', container) as HTMLInputElement, {
      target: { value: 'sample org' }
    })

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'maven',
          org: 'sample org',
          packageName: 'testPackage',
          versionRegex: '*.zip',
          groupId: 'test group',
          artifactId: 'test artifact',
          extension: 'test extension'
        }
      })
    })
  })

  test(`renders fine when selected deployment type is ssh and package type is maven and fields are runtime`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'maven',
        org: 'testOrg',
        packageName: 'testPackage',
        versionRegex: '*.zip',
        groupId: RUNTIME_INPUT_VALUE,
        artifactId: RUNTIME_INPUT_VALUE,
        extension: RUNTIME_INPUT_VALUE
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef
          initialValues={initialValues as any}
          ref={MockRef}
          {...props}
          selectedDeploymentType={ServiceDeploymentType.Ssh}
        />
      </TestWrapper>
    )

    expect(queryByNameAttribute('spec.packageType', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.org', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.packageName', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.versionRegex', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.groupId', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.artifactId', container)).not.toBeNull()
    expect(queryByNameAttribute('spec.extension', container)).not.toBeNull()

    fireEvent.change(queryByNameAttribute('spec.org', container) as HTMLInputElement, {
      target: { value: 'sample org' }
    })

    const submitBtn = getByText('submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'maven',
          org: 'sample org',
          packageName: 'testPackage',
          versionRegex: '*.zip',
          groupId: RUNTIME_INPUT_VALUE,
          artifactId: RUNTIME_INPUT_VALUE,
          extension: RUNTIME_INPUT_VALUE
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime input and versionType as value`, async () => {
    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Value,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'container',
        org: RUNTIME_INPUT_VALUE,
        packageName: RUNTIME_INPUT_VALUE,
        version: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef ref={MockRef} initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const versionInput = queryByNameAttribute('spec.version', container) as HTMLInputElement
    expect(versionInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for bucketName and filePath fields
    const cogVersion = document.getElementById('configureOptions_version')
    await userEvent.click(cogVersion!)
    await waitFor(() => expect(modals.length).toBe(1))
    const versionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(versionCOGModal, versionInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'container',
          org: RUNTIME_INPUT_VALUE,
          packageName: RUNTIME_INPUT_VALUE,
          version: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime input and versionType as regex`, async () => {
    jest.spyOn(cdng, 'useGetPackagesFromGithub').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: PackagesMockData,
          metaData: null,
          correlationId: 'ede8ab54-e8b6-4ac1-a9f0-1b42b0c9f8b7'
        },
        refetch: fetchPackagesMock,
        error: null,
        loading: false
      }
    })

    jest.spyOn(cdng, 'useGetVersionsFromPackages').mockImplementation((): any => {
      return {
        data: {
          status: 'SUCCESS',
          data: VersionsMockData,
          metaData: null,
          correlationId: '14aeac24-a895-4739-9deb-4c32ee0cea5a'
        },
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })

    const initialValues = {
      type: 'GithubPackageRegistry',
      ...commonInitialValues,
      versionType: TagTypes.Regex,
      spec: {
        ...commonInitialValues.spec,
        packageType: 'container',
        org: RUNTIME_INPUT_VALUE,
        packageName: RUNTIME_INPUT_VALUE,
        versionRegex: RUNTIME_INPUT_VALUE
      }
    }
    const { container } = render(
      <TestWrapper>
        <GithubPackageRegistryWithRef ref={MockRef} initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const packageTypeInput = queryByNameAttribute('spec.packageType', container) as HTMLInputElement
    const orgInput = queryByNameAttribute('spec.org', container) as HTMLInputElement
    const packageNameInput = queryByNameAttribute('spec.packageName', container) as HTMLInputElement
    const versionRegexInput = queryByNameAttribute('spec.versionRegex', container) as HTMLInputElement
    expect(packageTypeInput).not.toBeNull()
    expect(orgInput).not.toBeNull()
    expect(packageNameInput).not.toBeNull()
    expect(versionRegexInput).not.toBeNull()

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    // Configure options testing for bucketName and filePath fields

    const cogOrg = document.getElementById('configureOptions_org')
    await userEvent.click(cogOrg!)
    await waitFor(() => expect(modals.length).toBe(1))
    const orgCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(orgCOGModal, orgInput)

    const cogPackageName = document.getElementById('configureOptions_packageName')
    await userEvent.click(cogPackageName!)
    await waitFor(() => expect(modals.length).toBe(1))
    const packageNameCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(packageNameCOGModal, packageNameInput)

    const cogVersionRegex = document.getElementById('configureOptions_versionRegex')
    await userEvent.click(cogVersionRegex!)
    await waitFor(() => expect(modals.length).toBe(2))
    const versionRegexCOGModal = modals[1] as HTMLElement
    await doConfigureOptionsTesting(versionRegexCOGModal, versionRegexInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        spec: {
          connectorRef: 'testConnector',
          packageType: 'container',
          org: '<+input>.regex(<+input>.includes(/test/))',
          packageName: '<+input>.regex(<+input>.includes(/test/))',
          versionRegex: '<+input>.regex(<+input>.includes(/test/))'
        }
      })
    })
  })
})
