/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Formik,
  Layout,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle,
  getErrorInfoFromErrorObject,
  Container
} from '@harness/uicore'
import * as Yup from 'yup'
import { defaultTo, omit, pick } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikProps } from 'formik'
import {
  ServiceRequestDTO,
  ServiceResponseDTO,
  useUpsertServiceV2,
  useCreateServiceV2,
  useGetYamlSchema,
  ResponseServiceResponse
} from 'services/cd-ng'
import { queryClient } from 'services/queryClient'
import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'

import { PageSpinner } from '@common/components'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { yamlStringify } from '@common/utils/YamlHelperMethods'

import { useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { StoreType } from '@common/constants/GitSyncTypes'
import { GitSyncFormFields, gitSyncFormSchema } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { ConnectorSelectedValue } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { flexStart } from './DeployServiceUtils'
import type { NewEditServiceModalProps } from './DeployServiceInterface'
import NewEditServiceForm from './NewEditServiceForm'
import css from './DeployServiceStep.module.scss'

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `service.yaml`,
  entityType: 'Service',
  width: '100%',
  height: 194,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

const cleanData = (values: ServiceRequestDTO): ServiceRequestDTO => {
  const newDescription = values.description?.toString().trim()
  const newId = values.identifier?.toString().trim()
  const newName = values.name?.toString().trim()
  return {
    name: newName,
    identifier: newId,
    orgIdentifier: values.orgIdentifier,
    projectIdentifier: values.projectIdentifier,
    description: newDescription,
    tags: values.tags,
    yaml: yamlStringify({
      service: {
        ...omit(values, ['storeType', 'connectorRef', 'repo', 'branch', 'filePath'])
      }
    })
  }
}

export const NewEditServiceModal: React.FC<NewEditServiceModalProps> = ({
  isEdit,
  data,
  isService,
  onCreateOrUpdate,
  closeModal
}): JSX.Element => {
  const { getString } = useStrings()
  const isGitXEnabledForServices = useFeatureFlag(FeatureFlag.CDS_SERVICE_GITX)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
    accountId: string
  }>()

  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const { loading: createLoading, mutate: createService } = useCreateServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { loading: updateLoading, mutate: updateService } = useUpsertServiceV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { showSuccess, showError, clear } = useToaster()

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: async (
      gitData: SaveToGitFormInterface,
      payload?: ServiceRequestDTO
    ): Promise<ResponseServiceResponse> => {
      const isNewBranch = gitData?.isNewBranch
      const selectedBranch = formikRef.current?.values?.branch
      const response = await createService(
        { ...payload, orgIdentifier, projectIdentifier },
        {
          queryParams: {
            accountIdentifier: accountId,
            storeType: StoreType.REMOTE,
            connectorRef: (formikRef.current?.values?.connectorRef as unknown as ConnectorSelectedValue)?.value,
            repoName: formikRef.current?.values?.repo,
            isNewBranch: gitData?.isNewBranch,
            filePath: formikRef.current?.values?.filePath,
            ...(isNewBranch ? { baseBranch: selectedBranch, branch: gitData?.branch } : { branch: selectedBranch }),
            commitMsg: gitData?.commitMsg
          }
        }
      )
      if (response.status === 'SUCCESS') {
        clear()
        showSuccess(getString('cd.serviceCreated'))
        // We invalidate the service list call on creating a new service
        queryClient.invalidateQueries(['getServiceAccessList'])
        payload && onCreateOrUpdate(payload)
      }
      return Promise.resolve(response)
    }
  })

  const onSubmit = React.useCallback(
    async (value: ServiceRequestDTO) => {
      try {
        const values = cleanData(value)
        if (!values.name) {
          showError(getString('fieldRequired', { field: 'Service' }))
        } else if (!values.identifier) {
          showError(getString('common.validation.fieldIsRequired', { name: 'Identifier' }))
        } else if (isEdit && id !== values.identifier) {
          showError(getString('cd.editIdError', { id: id }))
        } else if (formikRef.current?.values?.storeType === StoreType.REMOTE) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'Service',
              name: values.name as string,
              identifier: values.identifier as string,
              gitDetails: {
                branch: formikRef.current?.values?.branch,
                commitId: undefined,
                filePath: formikRef.current?.values?.filePath,
                fileUrl: undefined,
                objectId: undefined,
                repoName: formikRef.current?.values?.repo,
                repoUrl: undefined
              },
              storeMetadata: {
                storeType: StoreType.REMOTE,
                connectorRef: (formikRef.current?.values?.connectorRef as unknown as ConnectorSelectedValue)?.value
              }
            },
            payload: {
              ...omit(values, ['storeType', 'connectorRef', 'repo', 'branch', 'filePath']),
              orgIdentifier,
              projectIdentifier
            }
          })
        } else if (isEdit && !isService) {
          const response = await updateService({
            ...omit(values, 'accountId', 'deleted'),
            orgIdentifier,
            projectIdentifier
          })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.serviceUpdated'))
            onCreateOrUpdate(values)
          }
        } else {
          const response = await createService({ ...values, orgIdentifier, projectIdentifier })
          if (response.status === 'SUCCESS') {
            clear()
            showSuccess(getString('cd.serviceCreated'))
            // We invalidate the service list call on creating a new service
            queryClient.invalidateQueries(['getServiceAccessList'])
            onCreateOrUpdate(values)
          }
        }
      } catch (e) {
        showError(getErrorInfoFromErrorObject(e, true))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onCreateOrUpdate, orgIdentifier, projectIdentifier, isEdit, isService]
  )

  const formikRef = React.useRef<FormikProps<ServiceResponseDTO & GitSyncFormFields>>()
  const id = data.identifier
  const { data: serviceSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Service',
      projectIdentifier,
      orgIdentifier,
      accountIdentifier: accountId,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = defaultTo(yamlHandler?.getLatestYaml(), '')
        const serviceSetYamlVisual = parse(yaml).service as ServiceResponseDTO
        if (serviceSetYamlVisual) {
          formikRef.current?.setValues({
            ...omit(cleanData(serviceSetYamlVisual) as ServiceResponseDTO),
            ...pick(formikRef.current?.values, ['storeType', 'connectorRef', 'repo', 'branch', 'filePath'])
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, data]
  )
  if (createLoading || updateLoading) {
    return <PageSpinner />
  }

  return (
    <>
      <Container className={css.yamlToggle}>
        <Layout.Horizontal flex={{ justifyContent: flexStart }} padding={{ top: 'small' }}>
          <VisualYamlToggle
            selectedView={selectedView}
            onChange={nextMode => {
              handleModeSwitch(nextMode)
            }}
          />
        </Layout.Horizontal>
      </Container>
      <Formik<Required<ServiceResponseDTO> & GitSyncFormFields>
        initialValues={data as Required<ServiceResponseDTO>}
        formName="deployService"
        onSubmit={values => {
          onSubmit(values)
        }}
        validationSchema={Yup.object().shape({
          name: NameSchema(getString, { requiredErrorMsg: getString?.('fieldRequired', { field: 'Service' }) }),
          identifier: IdentifierSchema(getString),
          ...(isGitXEnabledForServices ? { ...gitSyncFormSchema(getString) } : {})
        })}
      >
        {formikProps => {
          formikRef.current = formikProps as FormikProps<ServiceResponseDTO> | undefined
          return (
            <>
              {selectedView === SelectedView.VISUAL ? (
                <NewEditServiceForm
                  isEdit={isEdit}
                  formikProps={formikProps as FormikProps<ServiceResponseDTO & GitSyncFormFields>}
                  isGitXEnabledForServices={isGitXEnabledForServices}
                  closeModal={closeModal}
                />
              ) : (
                <Container className={css.editor}>
                  <YAMLBuilder
                    {...yamlBuilderReadOnlyModeProps}
                    existingJSON={{
                      service: {
                        ...omit(formikProps?.values, ['storeType', 'connectorRef', 'repo', 'branch', 'filePath']),
                        description: defaultTo(formikProps.values.description, ''),
                        tags: defaultTo(formikProps.values.tags, {})
                      }
                    }}
                    bind={setYamlHandler}
                    schema={serviceSchema?.data}
                  />
                  <Layout.Horizontal spacing={'small'} padding={{ top: 'large' }}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                      text={getString('save')}
                      onClick={() => {
                        const latestYaml = defaultTo(yamlHandler?.getLatestYaml(), '')
                        const errorMsg = yamlHandler?.getYAMLValidationErrorMap()
                        if (errorMsg?.size) {
                          showError(errorMsg.entries().next().value[1])
                        } else {
                          onSubmit(parse(latestYaml)?.service)
                        }
                      }}
                    />
                    <Button variation={ButtonVariation.TERTIARY} onClick={closeModal} text={getString('cancel')} />
                  </Layout.Horizontal>
                </Container>
              )}
            </>
          )
        }}
      </Formik>
    </>
  )
}
