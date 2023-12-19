/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, screen, act } from '@testing-library/react'
import { Link } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import {
  getMockFor_Generic_useMutate,
  mockValidateTemplateInputsOutOfSync
} from '@pipeline/components/RunPipelineModal/__tests__/mocks'

import routes from '@common/RouteDefinitions'
import { TemplateContextTestWrapper } from '@templates-library/utils/templateContextTestUtils'

import { DefaultTemplate } from 'framework/Templates/templates'
import { gitConfigs, sourceCodeManagers } from '@platform/connectors/mocks/mock'
import * as templateServices from 'services/template-ng'
import { findDialogContainer } from '@modules/10-common/utils/testUtils'
import { TemplateStudioInternal } from '../TemplateStudioInternal'
import templateContextProps from './__mock__/templateContextProps.json'

import templateDiffMockData from './__mock__/ templateDiffMockData.json'

jest.mock('services/cd-ng-rq', () => ({
  useListGitSyncQuery: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('services/template-ng', () => ({
  useGetTemplateSchema: jest.fn(() => ({})),
  useGetStaticSchemaYaml: jest.fn(() => ({})),
  useValidateTemplateInputs: jest.fn(() => getMockFor_Generic_useMutate()),
  useUpdateStableTemplate: jest.fn().mockImplementation(() => {
    return {
      mutate: () =>
        Promise.resolve({
          data: { name: 'date name' }
        }),
      loading: false
    }
  }),
  getRefreshedYamlPromise: jest.fn(() => getMockFor_Generic_useMutate())
}))

jest.mock('@harnessio/react-template-service-client', () => ({
  useGetTemplateSchemaQuery: jest.fn(() => ({}))
}))

jest.mock('services/cd-ng', () => ({
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetFileByBranch: () => ({
    data: {},
    mutate: jest.fn(),
    refetch: jest.fn()
  }),
  useCreatePR: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useCreatePRV2: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useCheckIfTemplateUsingV1Stage: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useGetSettingValue: jest.fn().mockImplementation(() => {
    return { data: { data: { value: 'false' } } }
  }),
  useGetSettingsList: jest.fn().mockImplementation(() => {
    return { data: { data: [] }, loading: false }
  }),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), loading: false }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn(() => ({}))
}))

const showError = jest.fn()
const showSuccess = jest.fn()
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError, showSuccess, clear: jest.fn() }))
}))

const updateTemplate = jest.fn()
const updateTemplateView = jest.fn()

const testWrapperProps = {
  path: routes.toTemplateStudio({
    accountId: ':accountId',
    orgIdentifier: ':orgIdentifier',
    projectIdentifier: ':projectIdentifier',
    templateType: ':templateType',
    templateIdentifier: ':templateIdentifier'
  }),
  pathParams: {
    accountId: 'dummy',
    orgIdentifier: 'dummy',
    projectIdentifier: 'dummy',
    templateType: 'dummy',
    templateIdentifier: 'dummy'
  },
  queryParams: {
    versionLabel: 'dummy'
  }
}

describe('<TemplateStudioInternal /> tests', () => {
  test('snapshot test for new template with git sync', () => {
    const newTemplateProps = {
      ...testWrapperProps,
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          template: DefaultTemplate
        }
      }
    }
    const { container } = render(
      <TemplateContextTestWrapper {...(newTemplateProps as any)}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for new template without git sync', () => {
    const newTemplateProps = {
      ...testWrapperProps,
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          template: DefaultTemplate
        }
      }
    }
    const { container } = render(
      <TemplateContextTestWrapper {...(newTemplateProps as any)} isGitSyncEnabled={false}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test for template studio in visual view', () => {
    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('view change toggling in template studio', async () => {
    /**
     * View change to yaml loads yaml builder
     * View change back to visual checks if valid yaml has been entered
     * Click on same view does not trigger any change
     */
    const { container } = render(
      <TemplateContextTestWrapper
        {...testWrapperProps}
        templateContextValues={{
          updateTemplate: updateTemplate,
          updateTemplateView: updateTemplateView
        }}
      >
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )

    const toggle = container.querySelector('[data-name="toggle-option-two"]')
    await userEvent.click(toggle!)
    await waitFor(() => expect(toggle?.className).toContain('PillToggle--selected'))

    const toggle2 = container.querySelector('[data-name="toggle-option-one"]')
    await userEvent.click(toggle2!)
    await waitFor(() => expect(toggle2?.className).toContain('PillToggle--selected'))

    await userEvent.click(toggle2!)
    await waitFor(() => expect(toggle2?.className).not.toEqual('PillToggle--item'))
  })

  test('is template studio loading', async () => {
    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ state: { isLoading: true } as any }}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[data-icon="steps-spinner"]')).not.toBeNull())
  })

  test('navigation on unsaved changes should give warning', async () => {
    const { container, getByText } = render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ ...(templateContextProps as any) }}>
        <TemplateStudioInternal />
        <Link
          className="redirect"
          to={routes.toTriggersPage({
            projectIdentifier: 'projectIdentifier',
            orgIdentifier: 'orgIdentifier',
            pipelineIdentifier: 'pipelineIdentifier',
            accountId: 'accountId',
            module: 'cd'
          })}
        >
          Redirect
        </Link>
      </TemplateContextTestWrapper>
    )

    const nameField = getByText('Test_ash')
    expect(nameField).toBeDefined()

    const redirectButton = container.querySelector('[class*="redirect"]')
    if (!redirectButton) {
      throw Error('redirect button')
    }
    fireEvent.click(redirectButton)

    await waitFor(() => expect(document.body.querySelector('[class*="dialog"]')).not.toBeNull())
    expect(document.body.querySelector('[data-icon="warning-icon"]')).not.toBeNull()
  })

  test('No entity found when template is not present in git', async () => {
    const newTemplateProps = {
      ...testWrapperProps,
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          template: DefaultTemplate,
          templateYamlError: {
            code: 'HINT',
            message: 'Please check the requested file path',
            responseMessages: [
              {
                code: 'HINT',
                level: 'INFO',
                message: 'Please check the requested file path'
              }
            ]
          }
        },
        storeMetadata: {
          storeType: 'REMOTE'
        }
      }
    }
    const { getByText } = render(
      <TemplateContextTestWrapper {...(newTemplateProps as any)} isGitSyncEnabled={true}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )
    expect(getByText('pipeline.gitExperience.noEntityFound')).toBeInTheDocument()
    expect(getByText('pipeline.gitExperience.selectDiffBranch')).toBeInTheDocument()
  })

  test('show generic error if template has been deleted', async () => {
    const templateProps = {
      pathParams: {
        ...testWrapperProps.pathParams,
        templateIdentifier: '-1'
      },
      templateContextValues: {
        state: {
          templateYamlError: {
            status: 'FAILURE',
            code: 'RESOURCE_NOT_FOUND_EXCEPTION',
            message: 'Template with the given Identifier: d and versionLabel: fc does not exist or has been deleted',
            errors: null
          }
        },
        storeMetadata: {
          storeType: 'INLINE'
        }
      }
    }
    const { getByText } = render(
      <TemplateContextTestWrapper {...(templateProps as any)} isGitSyncEnabled={true}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )
    expect(getByText('RESOURCE_NOT_FOUND_EXCEPTION')).toBeInTheDocument()
    expect(
      getByText('Template with the given Identifier: d and versionLabel: fc does not exist or has been deleted')
    ).toBeInTheDocument()
  })
})

describe('yaml validation in template studio', () => {
  test('yaml parsed but error in validation', async () => {
    const errorMap = new Map()
    errorMap.set(1, 'err1')
    errorMap.set(2, 'err2')

    const { container } = render(
      <TemplateContextTestWrapper
        {...testWrapperProps}
        templateContextValues={{
          state: {
            yamlHandler: {
              getLatestYaml: () => '---\template:\n  name: "uFXrIYA7TwyPav9UkH2s2w',
              getYAMLValidationErrorMap: () => errorMap
            }
          } as any
        }}
      >
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )

    const toggle = container.querySelector('[data-name="toggle-option-two"]')
    await userEvent.click(toggle!)
    expect(toggle?.className).toContain('PillToggle--selected')

    const toggle2 = container.querySelector('[data-name="toggle-option-one"]')
    await userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).toContain('PillToggle--selected'))

    await userEvent.click(toggle2!)
    waitFor(() => expect(toggle2?.className).not.toEqual('PillToggle--item'))
  })
})

describe('template studio reconcile test cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should not open reconcile dialog on clicking reconcile button, when loading state is true', async () => {
    jest.spyOn(templateServices, 'useValidateTemplateInputs').mockImplementation((): any => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn(),
        error: null
      }
    })
    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ ...(templateContextProps as any) }}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )

    const reconcileMenuOption = (await container.querySelector(
      'button[aria-label="pipeline menu actions"]'
    )) as HTMLElement
    await userEvent.click(reconcileMenuOption)
    const reconcileBtn = await screen.findByText('pipeline.outOfSyncErrorStrip.reconcile')
    await userEvent.click(reconcileBtn)
    expect(templateServices?.useValidateTemplateInputs).toHaveBeenCalled()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await waitFor(() => expect(reconcileDialog).toBeFalsy())
  })

  test('should open reconcile dialog on clicking reconcile button, when loading state is false & updates found in reconcile', async () => {
    jest
      .spyOn(templateServices, 'useValidateTemplateInputs')
      .mockImplementation((): any => mockValidateTemplateInputsOutOfSync)

    jest.spyOn(templateServices, 'getRefreshedYamlPromise').mockImplementation((): any => {
      templateDiffMockData
    })
    render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ ...(templateContextProps as any) }}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )

    const outOfSyncStrip = await screen.findByText('pipeline.outOfSyncErrorStrip.updatedTemplateInfo')
    expect(outOfSyncStrip).toBeInTheDocument()
    const reconcileBtn = await screen.findByText('pipeline.outOfSyncErrorStrip.reconcile')
    expect(reconcileBtn).toBeInTheDocument()
    userEvent.click(reconcileBtn)
    await waitFor(() => {
      expect(templateServices?.getRefreshedYamlPromise).toHaveBeenCalled()
    })
    await waitFor(() => expect(document.querySelector('.reconcileDialog')).toBeDefined())
    const closeReconcile = document?.querySelector('[data-icon="Stroke"]')!
    expect(closeReconcile).toBeDefined()
    act(() => {
      fireEvent.click(closeReconcile!)
    })
    await waitFor(() => expect(document.querySelector('.reconcileDialog')).not.toBeInTheDocument())
    act(() => {
      fireEvent.click(reconcileBtn!)
    })
    expect(templateServices?.getRefreshedYamlPromise).toHaveBeenCalled()
    await waitFor(() => expect(document.querySelector('.reconcileDialog')).toBeDefined())
  })

  test('should throw error, when loading state is false & errors found in reconcile', async () => {
    jest.spyOn(templateServices, 'useValidateTemplateInputs').mockImplementation((): any => {
      return {
        loading: false,
        refetch: jest.fn(),
        error: { message: 'error occured' }
      }
    })

    const { container } = render(
      <TemplateContextTestWrapper {...testWrapperProps} templateContextValues={{ ...(templateContextProps as any) }}>
        <TemplateStudioInternal />
      </TemplateContextTestWrapper>
    )
    const reconcileMenuOption = (await container.querySelector(
      'button[aria-label="pipeline menu actions"]'
    )) as HTMLElement
    await userEvent.click(reconcileMenuOption)
    const reconcileBtn = await screen.findByText('pipeline.outOfSyncErrorStrip.reconcile')
    await userEvent.click(reconcileBtn)
    expect(templateServices?.useValidateTemplateInputs).toHaveBeenCalled()
    expect(showError).toHaveBeenCalledWith('error occured')
  })
})
