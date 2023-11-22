/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  waitFor,
  queryByAttribute,
  getByText as getElementByText,
  fireEvent,
  screen
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { ManifestStoreMap, ManifestDataType } from '../../../Manifesthelper'
import { TasManifestWithArtifactBundle } from '../TasManifestWithArtifactBundle'

const props = {
  stepName: 'Manifest Details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  handleSubmit: jest.fn(),
  manifestIdsList: [],
  selectedManifest: ManifestDataType.TasManifest,
  prevStepData: { store: ManifestStoreMap.ArtifactBundle },
  previousStep: jest.fn()
}

const doConfigureOptionsTesting = async (cogModal: HTMLElement, fieldElement: HTMLInputElement): Promise<void> => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  await userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues')
  fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  const cogSubmit = getElementByText(cogModal, 'submit')
  await userEvent.click(cogSubmit)
  await waitFor(() => expect(fieldElement.value).toBe('<+input>.regex(<+input>.includes(/test/))'))
}

describe('ServerlessLambdaWithS3 tests', () => {
  beforeEach(() => {
    props.handleSubmit.mockReset()
  })

  test('should render new manifest view for TasManifest with ArtifactBundle manifest store', async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.TasManifest,
      spec: {
        store: {
          type: ManifestStoreMap.ArtifactBundle
        }
      }
    }
    const { container } = render(
      <TestWrapper>
        <TasManifestWithArtifactBundle {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    const idField = queryByNameAttribute('identifier')
    expect(idField).not.toBeNull()

    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    const identifier = 'TasWithArtifactBundle'

    const allDropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(allDropdownIcons).toHaveLength(2)
    const artifactBundleTypeDropDownIcon = allDropdownIcons[1]
    expect(artifactBundleTypeDropDownIcon).toBeInTheDocument()

    const deployableUnitPathInput = queryByNameAttribute('deployableUnitPath')
    expect(deployableUnitPathInput).toBeInTheDocument()

    const manifestPathInput = queryByNameAttribute('manifestPath')
    expect(manifestPathInput).toBeInTheDocument()

    let addFileButtons = screen.getAllByText('addFileText')
    expect(addFileButtons).toHaveLength(2)

    const addVarFileButton = addFileButtons[0]
    fireEvent.click(addVarFileButton)
    const varPath1Input = queryByNameAttribute('varsPaths[0].path')
    await waitFor(() => expect(varPath1Input).toBeInTheDocument())

    const addAutoScalerFileButton = addFileButtons[1]
    fireEvent.click(addAutoScalerFileButton)
    const autoScaler1Input = queryByNameAttribute('autoScalerPath[0].path') as HTMLInputElement
    await waitFor(() => expect(autoScaler1Input).toBeInTheDocument())

    addFileButtons = screen.getAllByText('addFileText')
    expect(addFileButtons).toHaveLength(1)

    const submitBtn = screen.getByText('submit')
    fireEvent.click(submitBtn)

    // Check for validation errors
    const varsPathRequiredErr = await screen.findByText('pipeline.manifestType.varsPathRequired')
    expect(varsPathRequiredErr).toBeInTheDocument()
    const autoScalerPathRequiredErr = await screen.findByText('pipeline.manifestType.autoScalerPathRequired')
    expect(autoScalerPathRequiredErr).toBeInTheDocument()
    const allFieldIsRequiredErrors = await screen.findAllByText('common.validation.fieldIsRequired')
    expect(allFieldIsRequiredErrors).toHaveLength(3) // identifier, deployableUnitPath, manifestPath

    // Fill in the values
    fireEvent.change(idField!, { target: { value: identifier } })
    fireEvent.click(artifactBundleTypeDropDownIcon!)
    const zipBundleTypeItem = screen.queryByText('pipeline.phasesForm.packageTypes.zip')
    await waitFor(() => expect(zipBundleTypeItem).toBeInTheDocument())
    const tarBundleTypeItem = screen.queryByText('pipeline.phasesForm.packageTypes.tar')
    expect(tarBundleTypeItem).toBeInTheDocument()
    const tarZipBundleTypeItem = screen.queryByText('pipeline.phasesForm.packageTypes.tar_gzip')
    expect(tarZipBundleTypeItem).toBeInTheDocument()
    fireEvent.click(zipBundleTypeItem!)
    const artifactBundleTypeSelect = queryByNameAttribute('artifactBundleType') as HTMLInputElement
    expect(artifactBundleTypeSelect.value).toBe('pipeline.phasesForm.packageTypes.zip')
    fireEvent.change(deployableUnitPathInput!, { target: { value: 'dup' } })
    fireEvent.change(manifestPathInput!, { target: { value: 'mp' } })
    fireEvent.change(varPath1Input!, { target: { value: 'varPath1.yaml' } })
    fireEvent.change(autoScaler1Input!, { target: { value: 'autoScalerPath1.yaml' } })
    await waitFor(() => expect(autoScaler1Input.value).toBe('autoScalerPath1.yaml'))

    // Submit the form
    fireEvent.click(submitBtn)

    await waitFor(() => expect(props.handleSubmit).toHaveBeenCalled())
    expect(props.handleSubmit).toHaveBeenCalledWith({
      manifest: {
        identifier,
        type: ManifestDataType.TasManifest,
        spec: {
          cfCliVersion: 'V7',
          store: {
            type: ManifestStoreMap.ArtifactBundle,
            spec: {
              artifactBundleType: 'ZIP',
              deployableUnitPath: 'dup',
              manifestPath: 'mp'
            }
          },
          varsPaths: ['varPath1.yaml'],
          autoScalerPath: ['autoScalerPath1.yaml']
        }
      }
    })
  })

  test(`renders fine for existing manifest values`, async () => {
    const initialValues = {
      identifier: 'testidentifier',
      type: ManifestDataType.TasManifest,
      spec: {
        cfCliVersion: 'V7',
        store: {
          type: ManifestStoreMap.ArtifactBundle,
          spec: {
            artifactBundleType: 'TAR',
            deployableUnitPath: 'dup1',
            manifestPath: 'mp1'
          }
        },
        varsPaths: ['varPath.yaml'],
        autoScalerPath: ['autoScalerPath.yaml']
      }
    }
    const { container, getByText } = render(
      <TestWrapper>
        <TasManifestWithArtifactBundle {...props} initialValues={initialValues} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const allDropdownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(allDropdownIcons).toHaveLength(2)

    const deployableUnitPathInput = queryByNameAttribute('deployableUnitPath')
    expect(deployableUnitPathInput).toBeInTheDocument()

    const manifestPathInput = queryByNameAttribute('manifestPath')
    expect(manifestPathInput).toBeInTheDocument()

    const addFileButtons = screen.getAllByText('addFileText')
    expect(addFileButtons).toHaveLength(1)

    const varPath1Input = queryByNameAttribute('varsPaths[0].path')
    await waitFor(() => expect(varPath1Input).toBeInTheDocument())

    const autoScaler1Input = queryByNameAttribute('autoScalerPath[0].path') as HTMLInputElement
    await waitFor(() => expect(autoScaler1Input).toBeInTheDocument())

    const submitBtn = getByText('submit')
    await userEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'testidentifier',
          type: ManifestDataType.TasManifest,
          spec: {
            cfCliVersion: 'V7',
            store: {
              type: ManifestStoreMap.ArtifactBundle,
              spec: {
                artifactBundleType: 'TAR',
                deployableUnitPath: 'dup1',
                manifestPath: 'mp1'
              }
            },
            varsPaths: ['varPath.yaml'],
            autoScalerPath: ['autoScalerPath.yaml']
          }
        }
      })
    })
  })

  test(`configure values should work fine when all values are runtime inputs`, async () => {
    const initialValues = {
      identifier: 'TasManifestRuntime',
      type: ManifestDataType.TasManifest,
      spec: {
        cfCliVersion: 'V7',
        store: {
          type: ManifestStoreMap.ArtifactBundle,
          spec: {
            artifactBundleType: 'ZIP',
            deployableUnitPath: RUNTIME_INPUT_VALUE,
            manifestPath: RUNTIME_INPUT_VALUE
          }
        },
        varsPaths: RUNTIME_INPUT_VALUE,
        autoScalerPath: RUNTIME_INPUT_VALUE
      }
    }

    const { container } = render(
      <TestWrapper>
        <TasManifestWithArtifactBundle initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    const deployableUnitPathInput = queryByNameAttribute('deployableUnitPath') as HTMLInputElement
    expect(deployableUnitPathInput).toBeInTheDocument()
    expect(deployableUnitPathInput.value).toBe(RUNTIME_INPUT_VALUE)
    const manifestPathInput = queryByNameAttribute('manifestPath') as HTMLInputElement
    expect(manifestPathInput).toBeInTheDocument()
    expect(manifestPathInput.value).toBe(RUNTIME_INPUT_VALUE)
    const varsPathsInput = queryByNameAttribute('varsPaths') as HTMLInputElement
    expect(varsPathsInput).toBeInTheDocument()
    expect(varsPathsInput.value).toBe(RUNTIME_INPUT_VALUE)
    const autoScalerPathInput = queryByNameAttribute('autoScalerPath') as HTMLInputElement
    expect(autoScalerPathInput).toBeInTheDocument()
    expect(autoScalerPathInput.value).toBe(RUNTIME_INPUT_VALUE)

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const cogDeployableUnitPath = document.getElementById('configureOptions_deployableUnitPath')
    await userEvent.click(cogDeployableUnitPath!)
    await waitFor(() => expect(modals.length).toBe(1))
    const regionCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(regionCOGModal, deployableUnitPathInput)

    const cogManifestPath = document.getElementById('configureOptions_manifestPath')
    await userEvent.click(cogManifestPath!)
    await waitFor(() => expect(modals.length).toBe(1))
    const manifestPathCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(manifestPathCOGModal, manifestPathInput)

    const cogVarsPaths = document.getElementById('configureOptions_varsPaths')
    await userEvent.click(cogVarsPaths!)
    await waitFor(() => expect(modals.length).toBe(1))
    const varsPathsCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(varsPathsCOGModal, varsPathsInput)

    const cogAutoScalerPath = document.getElementById('configureOptions_autoScalerPath')
    await userEvent.click(cogAutoScalerPath!)
    await waitFor(() => expect(modals.length).toBe(1))
    const autoScalerPathCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(autoScalerPathCOGModal, autoScalerPathInput)

    const submitBtn = getElementByText(container, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(props.handleSubmit).toBeCalled()
      expect(props.handleSubmit).toHaveBeenCalledWith({
        manifest: {
          identifier: 'TasManifestRuntime',
          type: ManifestDataType.TasManifest,
          spec: {
            cfCliVersion: 'V7',
            store: {
              type: ManifestStoreMap.ArtifactBundle,
              spec: {
                artifactBundleType: 'ZIP',
                deployableUnitPath: '<+input>.regex(<+input>.includes(/test/))',
                manifestPath: '<+input>.regex(<+input>.includes(/test/))'
              }
            },
            varsPaths: '<+input>.regex(<+input>.includes(/test/))',
            autoScalerPath: '<+input>.regex(<+input>.includes(/test/))'
          }
        }
      })
    })
  })

  test(`clicking on back button should call props.previousStep`, async () => {
    const initialValues = {
      identifier: 'test',
      type: ManifestDataType.TasManifest,
      spec: {
        cfCliVersion: 'V7',
        store: {
          type: ManifestStoreMap.ArtifactBundle,
          spec: {
            artifactBundleType: 'TAR',
            deployableUnitPath: 'dup1',
            manifestPath: 'mp1'
          }
        },
        varsPaths: ['varPath.yaml'],
        autoScalerPath: ['autoScalerPath.yaml']
      }
    }

    const { container } = render(
      <TestWrapper>
        <TasManifestWithArtifactBundle initialValues={initialValues as any} {...props} />
      </TestWrapper>
    )

    const backBtn = getElementByText(container, 'back')
    fireEvent.click(backBtn)
    await waitFor(() => {
      expect(props.previousStep).toHaveBeenCalled()
    })
    expect(props.previousStep).toHaveBeenCalledWith({
      store: ManifestStoreMap.ArtifactBundle
    })
  })
})
