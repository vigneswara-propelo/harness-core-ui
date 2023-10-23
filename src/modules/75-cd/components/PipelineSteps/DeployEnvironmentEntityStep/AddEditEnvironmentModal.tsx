/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { defaultTo, get, omit } from 'lodash-es'
import * as Yup from 'yup'
import { parse } from 'yaml'

import {
  Button,
  ButtonVariation,
  Formik,
  FormikForm,
  Layout,
  VisualYamlSelectedView as SelectedView,
  getErrorInfoFromErrorObject,
  Container
} from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import {
  useUpsertEnvironmentV2,
  NGEnvironmentInfoConfig,
  NGEnvironmentConfig,
  EnvironmentResponseDTO,
  EnvironmentResponse,
  EnvironmentRequestDTO,
  ResponseEnvironmentResponse,
  useCreateEnvironmentV2,
  useUpdateEnvironmentV2,
  UpdateEnvironmentV2QueryParams
} from 'services/cd-ng'

import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'

import EnvironmentConfiguration from '@cd/components/EnvironmentsV2/EnvironmentDetails/EnvironmentConfiguration/EnvironmentConfiguration'

import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { GitSyncFormFields } from '@modules/40-gitsync/components/GitSyncForm/GitSyncForm'
import { useSaveToGitDialog } from '@modules/10-common/modals/SaveToGitDialog/useSaveToGitDialog'
import { GitData } from '@modules/10-common/modals/GitDiffEditor/useGitDiffEditorDialog'
import { sanitize } from '@modules/10-common/utils/JSONUtils'
import { ConnectorSelectedValue } from '@modules/27-platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import css from './DeployEnvironmentEntityStep.module.scss'

export interface AddEditEnvironmentModalProps {
  data: NGEnvironmentConfig & Pick<EnvironmentResponseDTO, 'storeType' | 'connectorRef' | 'entityGitDetails'>
  onCreateOrUpdate(data: EnvironmentResponseDTO): void
  closeModal?: () => void
  isEdit: boolean
  onCreateOrUpdateInsideGroup?: (newEnv: EnvironmentResponse) => void
  insideGroupEnv?: boolean
  isServiceOverridesEnabled?: boolean
}

export default function AddEditEnvironmentModal({
  data,
  onCreateOrUpdate,
  closeModal,
  isEdit,
  onCreateOrUpdateInsideGroup,
  insideGroupEnv,
  isServiceOverridesEnabled
}: AddEditEnvironmentModalProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()

  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedView, setSelectedView] = useState<SelectedView>(SelectedView.VISUAL)
  const { loading: upsertLoading, mutate: upsertEnvironment } = useUpsertEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { loading: createLoading, mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { loading: updateLoading, mutate: updateEnvironment } = useUpdateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const formikRef =
    useRef<FormikProps<NGEnvironmentInfoConfig & Partial<GitSyncFormFields & { storeType: StoreType }>>>()

  const afterUpdateHandler = (response: ResponseEnvironmentResponse): void => {
    clear()
    showSuccess(getString(isEdit ? 'cd.environmentUpdated' : 'cd.environmentCreated'))
    onCreateOrUpdate(defaultTo(response.data?.environment, {}))
    if (insideGroupEnv && onCreateOrUpdateInsideGroup && response?.data) {
      onCreateOrUpdateInsideGroup(response?.data)
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (gitData: GitData, environmentPayload?: EnvironmentRequestDTO): Promise<ResponseEnvironmentResponse> => {
      const createUpdatePromise = !isEdit
        ? createEnvironment({ ...environmentPayload, orgIdentifier, projectIdentifier } as EnvironmentRequestDTO, {
            queryParams: {
              accountIdentifier: accountId,
              storeType: StoreType.REMOTE,
              connectorRef: (formikRef.current?.values?.connectorRef as unknown as ConnectorSelectedValue)?.value,
              repoName: formikRef.current?.values?.repo,
              isNewBranch: gitData?.isNewBranch,
              filePath: formikRef.current?.values?.filePath,
              ...(gitData?.isNewBranch
                ? { baseBranch: formikRef.current?.values?.branch, branch: gitData?.branch }
                : { branch: formikRef.current?.values?.branch }),
              commitMsg: gitData?.commitMsg
            }
          })
        : updateEnvironment({ ...environmentPayload } as EnvironmentRequestDTO, {
            queryParams: {
              accountIdentifier: accountId,
              storeType: StoreType.REMOTE,
              connectorRef: (formikRef.current?.values?.connectorRef as unknown as ConnectorSelectedValue)?.value,
              isNewBranch: gitData?.isNewBranch, //Need BE API support for this param, Todo: remove typeCast
              repoIdentifier: formikRef.current?.values?.repo,
              filePath: formikRef.current?.values?.filePath,
              ...(gitData?.isNewBranch
                ? { baseBranch: formikRef.current?.values?.branch, branch: gitData?.branch }
                : { branch: formikRef.current?.values?.branch }),
              commitMsg: gitData?.commitMsg,
              lastObjectId: data?.entityGitDetails?.objectId,
              lastCommitId: data?.entityGitDetails?.commitId,
              resolvedConflictCommitId: gitData?.resolvedConflictCommitId
            } as unknown as UpdateEnvironmentV2QueryParams
          })
      return createUpdatePromise.then(response => {
        afterUpdateHandler(response)
        return response
      })
    }
  })

  const onSubmit = useCallback(
    async (values: NGEnvironmentInfoConfig & Partial<GitSyncFormFields & { storeType: StoreType }>) => {
      try {
        const bodyWithoutYaml = {
          name: values.name,
          description: values.description,
          identifier: values.identifier,
          orgIdentifier: values.orgIdentifier,
          projectIdentifier: values.projectIdentifier,
          tags: values.tags,
          type: defaultTo(values.type, 'Production')
        }
        const body = {
          ...bodyWithoutYaml,
          yaml: yamlStringify({
            environment: sanitize(
              { ...omit(values, 'repo', 'branch', 'connectorRef', 'filePath', 'storeType') },
              { removeEmptyObject: false, removeEmptyString: false }
            )
          })
        }
        if (get(values, 'storeType') === StoreType.REMOTE) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'Environment',
              name: defaultTo(values.name, ''),
              identifier: defaultTo(values.identifier, ''),
              gitDetails: {
                branch: values?.branch,
                repoIdentifier: get(values, 'repo', ''),
                filePath: get(values, 'filePath', '')
              },
              storeMetadata: {
                storeType: StoreType.REMOTE,
                connectorRef: get(values, 'connectorRef', '') as string
              }
            },
            payload: body
          })
        } else {
          const response = await upsertEnvironment(body)
          if (response.status === 'SUCCESS') {
            afterUpdateHandler(response)
          }
        }
      } catch (e: any) {
        showError(getErrorInfoFromErrorObject(e, true))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier]
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const {
    name,
    identifier,
    description,
    tags,
    type,
    variables,
    overrides,
    orgIdentifier: envOrgIdentifier,
    projectIdentifier: envProjectIdentifier
  } = get(data, 'environment', {} as NGEnvironmentInfoConfig)

  return (
    <Formik<NGEnvironmentInfoConfig & Partial<GitSyncFormFields & { storeType: StoreType }>>
      initialValues={
        {
          name: defaultTo(name, ''),
          identifier: defaultTo(identifier, ''),
          description: defaultTo(description, ''),
          tags: defaultTo(tags, {}),
          type: defaultTo(type, ''),
          orgIdentifier: isEdit ? envOrgIdentifier : orgIdentifier,
          projectIdentifier: isEdit ? envProjectIdentifier : projectIdentifier,
          storeType: StoreType.INLINE,
          variables,
          overrides
        } as NGEnvironmentInfoConfig
      }
      formName="editEnvironment"
      onSubmit={
        /* istanbul ignore next */ values => {
          onSubmit?.({ ...values })
        }
      }
      validationSchema={Yup.object().shape({
        name: NameSchema(getString, { requiredErrorMsg: getString('fieldRequired', { field: 'Name' }) }),
        identifier: IdentifierSchema(getString),
        type: Yup.string().required().oneOf(['Production', 'PreProduction'])
      })}
      validateOnChange
    >
      {formikProps => {
        formikRef.current = formikProps
        return (
          <>
            <FormikForm>
              <Container
                background={Color.FORM_BG}
                padding={{ top: 'large', right: 'medium', bottom: 'large', left: 'xlarge' }}
              >
                <EnvironmentConfiguration
                  formikProps={formikProps}
                  selectedView={selectedView}
                  setSelectedView={setSelectedView}
                  yamlHandler={yamlHandler}
                  setYamlHandler={setYamlHandler}
                  isModified={false}
                  data={{ data: data }}
                  isEdit={isEdit}
                  isServiceOverridesEnabled={isServiceOverridesEnabled}
                  scope={getScopeFromDTO(
                    isEdit
                      ? {
                          accountIdentifier: accountId,
                          orgIdentifier: envOrgIdentifier,
                          projectIdentifier: envProjectIdentifier
                        }
                      : { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
                  )}
                />
              </Container>
            </FormikForm>
            <Layout.Horizontal
              spacing="medium"
              padding={{ top: 'xlarge', left: 'huge', bottom: 'large' }}
              className={css.modalFooter}
            >
              <Button
                variation={ButtonVariation.PRIMARY}
                type={'submit'}
                text={getString('save')}
                data-id="environment-edit"
                onClick={
                  /* istanbul ignore next */ () => {
                    if (selectedView === SelectedView.YAML) {
                      const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), /* istanbul ignore next */ '')
                      onSubmit(parse(latestYaml)?.environment)
                    } else {
                      formikProps.submitForm()
                    }
                  }
                }
                disabled={upsertLoading || createLoading || updateLoading}
              />
              <Button
                variation={ButtonVariation.TERTIARY}
                text={getString('cancel')}
                onClick={closeModal}
                disabled={upsertLoading || createLoading || updateLoading}
              />
            </Layout.Horizontal>
          </>
        )
      }}
    </Formik>
  )
}
