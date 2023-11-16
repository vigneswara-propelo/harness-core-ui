import React from 'react'
import * as uuid from 'uuid'

import { render, findByTestId, findByText, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper, queryByNameAttribute, doConfigureOptionsTesting } from '@common/utils/testUtils'
import { Scope } from '@modules/10-common/interfaces/SecretsInterface'

import type { ManifestStepInitData } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { K8sRemoteFile } from '../K8sRemote'

jest.mock('uuid')

const onSubmitCallBack = jest.fn()

const props = {
  stepName: 'Manifest details',
  expressions: [],
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  onSubmitCallBack,
  manifestIdsList: [],
  fieldPath: 'manifestSource.spec',
  isReadonly: false
}

const initialValues: ManifestStepInitData = {
  connectorRef: {
    label: 'autosync',
    value: 'account.autosync',
    scope: 'account' as Scope,
    live: true,
    connector: {
      name: 'autosync',
      identifier: 'autosync',
      description: '',
      accountIdentifier: 'OgiB4-xETamKNVAz-wQRjw',
      orgIdentifier: '',
      projectIdentifier: '',
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com/yyy',
        validationRepo: 'test-repo',
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: {
              username: 'autouser3-yyy',
              usernameRef: null,
              tokenRef: 'account.autosync3'
            }
          }
        },
        apiAccess: {
          type: 'Token',
          spec: {
            tokenRef: 'account.autosync3'
          }
        },
        delegateSelectors: [],
        executeOnDelegate: false,
        type: 'Account'
      }
    }
  },
  manifestSource: {
    type: 'K8sManifest',
    spec: {
      valuesPaths: ['cc', 'zza'],
      store: {
        type: 'Github',
        spec: {
          connectorRef: 'account.autosync',
          paths: ['sa', 'a'],
          gitFetchType: 'Branch',
          branch: 'ds'
        }
      }
    }
  },
  store: 'Github',
  selectedManifest: ManifestDataType.K8sManifest
}

const initialRuntimeValues: ManifestStepInitData = {
  connectorRef: RUNTIME_INPUT_VALUE,
  manifestSource: {
    type: 'K8sManifest',
    spec: {
      valuesPaths: RUNTIME_INPUT_VALUE,
      store: {
        type: 'Github',
        spec: {
          connectorRef: RUNTIME_INPUT_VALUE,
          paths: RUNTIME_INPUT_VALUE,
          gitFetchType: 'Branch',
          branch: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  store: 'Github',
  selectedManifest: ManifestDataType.K8sManifest
}

describe('Remote K8sApply Details tests', () => {
  beforeEach(() => jest.spyOn(uuid, 'v5').mockReturnValue('MockedUUID'))

  test('initial rendering', async () => {
    const { container } = render(
      <TestWrapper>
        <K8sRemoteFile {...props} prevStepData={initialValues} />
      </TestWrapper>
    )
    const addPathBtn = await findByTestId(container, 'addFilePath')!
    expect(addPathBtn).toBeInTheDocument()
    await userEvent.click(addPathBtn)
    const removePathBtn = await findByTestId(container, 'removeFilePath2')!
    await userEvent.click(removePathBtn)
    const addValueBtn = await findByTestId(container, 'addValuesPath')!
    await userEvent.click(addValueBtn)
    const removeValueBtn = await findByTestId(container, 'removeValuesPath2')!
    await userEvent.click(removeValueBtn)
    const submit = await findByText(container, 'submit')
    await userEvent.click(submit)
    expect(onSubmitCallBack).toHaveBeenCalledWith({ ...initialValues })
    expect(container).toBeDefined()
  })
  test('initial rendering runtime values', async () => {
    const { container } = render(
      <TestWrapper>
        <K8sRemoteFile {...props} prevStepData={initialRuntimeValues} />
      </TestWrapper>
    )

    const submit = await findByText(container, 'submit')
    await userEvent.click(submit)
    expect(onSubmitCallBack).toHaveBeenCalledWith({ ...initialRuntimeValues })
    expect(container).toBeDefined()
  })

  test('initial rendering runtime values', async () => {
    const { container } = render(
      <TestWrapper>
        <K8sRemoteFile {...props} prevStepData={initialRuntimeValues} />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const branchInput = queryByNameAttribute('manifestSource.spec.store.spec.branch', container) as HTMLInputElement
    expect(branchInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogBranchInputRef = document.getElementById('configureOptions_manifestSource.spec.store.spec.branch')
    await userEvent.click(cogBranchInputRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const branchRefCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(branchRefCOG, branchInput)

    const submit = await findByText(container, 'submit')
    await userEvent.click(submit)
    expect(onSubmitCallBack).toHaveBeenCalledWith({ ...initialRuntimeValues })
    expect(container).toBeDefined()
  })

  test('initial rendering git type runtime values/commitId', async () => {
    const { container } = render(
      <TestWrapper>
        <K8sRemoteFile
          {...props}
          prevStepData={{
            connectorRef: RUNTIME_INPUT_VALUE,
            manifestSource: {
              type: 'K8sManifest',
              spec: {
                valuesPaths: RUNTIME_INPUT_VALUE,
                store: {
                  type: 'Git',
                  spec: {
                    connectorRef: RUNTIME_INPUT_VALUE,
                    paths: RUNTIME_INPUT_VALUE,
                    gitFetchType: 'Commit',
                    commitId: RUNTIME_INPUT_VALUE
                  }
                }
              }
            },
            store: 'Git',
            selectedManifest: ManifestDataType.K8sManifest
          }}
        />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const commitInput = queryByNameAttribute('manifestSource.spec.store.spec.commitId', container) as HTMLInputElement
    expect(commitInput.value).toBe(RUNTIME_INPUT_VALUE)
    const cogCommitInputRef = document.getElementById('configureOptions_manifestSource.spec.store.spec.commitId')
    await userEvent.click(cogCommitInputRef!)
    await waitFor(() => expect(modals.length).toBe(1))
    const commitRefCOG = modals[0] as HTMLElement
    await doConfigureOptionsTesting(commitRefCOG, commitInput)

    const submit = await findByText(container, 'submit')
    await userEvent.click(submit)
    expect(onSubmitCallBack).toHaveBeenCalledWith({ ...initialRuntimeValues })
    expect(container).toBeDefined()
  })
})
