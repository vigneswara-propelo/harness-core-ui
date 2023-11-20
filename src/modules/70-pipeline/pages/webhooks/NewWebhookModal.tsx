/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, FormInput, Formik, Layout, Text, Icon, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { FieldArray, Form, FormikProps } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useCreateGitxWebhookRefMutation, useUpdateGitxWebhookRefMutation } from '@harnessio/react-ng-manager-client'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import ConnectorReferenceField from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getSupportedProviders } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { useStrings } from 'framework/strings'
import { getConnectorIdentifierWithScope } from '@platform/connectors/utils/utils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { NameIdentifierSchema } from '@common/utils/Validation'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import { AddWebhookModalData, NewWebhookModalProps } from './utils'
import css from './Webhooks.module.scss'

export default function NewWebhookModal(props: NewWebhookModalProps): JSX.Element {
  const { initialData, isEdit, closeModal } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const formikRef = React.useRef<FormikProps<AddWebhookModalData>>()
  const [errorMessages, setErrorMessages] = React.useState<ResponseMessage[]>([])

  const {
    data,
    isLoading: loading,
    mutate: createWebhook,
    error: webhookCreateError
  } = useCreateGitxWebhookRefMutation({})

  const {
    data: webhookUpdateData,
    isLoading: loadingUpdateWebhook,
    mutate: updateWebhook,
    error: webhookUpdateError
  } = useUpdateGitxWebhookRefMutation({})

  function handleSubmit(values: AddWebhookModalData): void {
    const folder_paths = values.folderPaths.map(path => path.value)

    isEdit
      ? updateWebhook({
          pathParams: {
            org: orgIdentifier,
            project: projectIdentifier,
            'gitx-webhook': values.identifier
          },
          body: {
            connector_ref: values.connectorRef,
            folder_paths: folder_paths,
            repo_name: values.repo,
            webhook_name: values.name
          }
        })
      : createWebhook({
          pathParams: {
            org: orgIdentifier,
            project: projectIdentifier
          },
          body: {
            connector_ref: values.connectorRef,
            folder_paths: folder_paths,
            repo_name: values.repo,
            webhook_identifier: values.identifier,
            webhook_name: values.name
          }
        })
  }

  React.useEffect(() => {
    const errorMessage = [...errorMessages]
    if (webhookCreateError) {
      errorMessage.push({ message: (webhookCreateError as Error).message, level: 'ERROR' })
    }
    if (webhookUpdateError) {
      errorMessage.push({ message: (webhookUpdateError as Error).message, level: 'ERROR' })
    }
    setErrorMessages(errorMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webhookCreateError, webhookUpdateError])

  if (data || webhookUpdateData) {
    return (
      <Layout.Vertical flex={{ alignItems: 'center' }} padding={'large'}>
        <Icon name="success-tick" size={34} padding={'small'} />
        <Text font={{ variation: FontVariation.H3 }} padding={'medium'} className={css.textAlign}>
          {getString(isEdit ? 'pipeline.webhooks.successUpdateMessage' : 'pipeline.webhooks.successMessage', {
            name: get(formikRef.current?.values, 'name', '')
          })}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} padding={'small'}>
          {getString('pipeline.webhooks.successSubtitle')}
        </Text>
      </Layout.Vertical>
    )
  }

  return (
    <Formik<AddWebhookModalData>
      initialValues={initialData}
      formName="addWebhookModalData"
      onSubmit={handleSubmit}
      validationSchema={NameIdentifierSchema(getString, {
        nameRequiredErrorMsg: getString('common.validation.fieldIsRequired', {
          name: getString('name')
        })
      }).shape({
        connectorRef: Yup.string().required(
          getString('common.validation.fieldIsRequired', {
            name: getString('platform.connectors.title.gitConnector')
          })
        ),
        repo: Yup.string().required(
          getString('common.validation.fieldIsRequired', {
            name: getString('repository')
          })
        )
      })}
    >
      {formik => {
        formikRef.current = formik
        return (
          <Form>
            {loading || loadingUpdateWebhook ? (
              <ContainerSpinner message={getString('pipeline.webhooks.settingUpWebhook')} padding={'large'} />
            ) : errorMessages.length > 0 ? (
              <Layout.Vertical flex={{ alignItems: 'center' }}>
                <Icon name="warning-sign" size={34} padding={'small'} color={Color.RED_500} />
                <Text font={{ variation: FontVariation.H3 }} padding={'medium'}>
                  {getString('pipeline.webhookEvents.failedCreateWebhook')}
                </Text>
                <ErrorHandler responseMessages={errorMessages} className={css.errorHandler} />
                <Button
                  text={getString('pipeline.webhookEvents.backToEdit')}
                  onClick={() => setErrorMessages([])}
                  variation={ButtonVariation.PRIMARY}
                />
              </Layout.Vertical>
            ) : (
              <Layout.Vertical>
                <Container className={css.modalHeader}>
                  <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'small' }}>
                    {isEdit ? getString('pipeline.webhooks.editWebhook') : getString('pipeline.webhooks.newWebhook')}
                  </Text>
                  <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_500}>
                    {getString('pipeline.webhooks.createSubtitle')}
                  </Text>
                </Container>
                <Layout.Vertical className={css.addWebhookModalForm}>
                  <NameId
                    identifierProps={{
                      inputName: 'name',
                      isIdentifierEditable: !isEdit
                    }}
                  />
                  <ConnectorReferenceField
                    name="connectorRef"
                    width={353}
                    tooltipProps={{ dataTooltipId: 'webhook-connectorRef' }}
                    type={getSupportedProviders()}
                    selected={get(formik.values, 'connectorRef')}
                    error={formik.submitCount > 0 ? (formik.errors?.connectorRef as string) : undefined}
                    label={getString('platform.connectors.title.gitConnector')}
                    placeholder={`- ${getString('select')} -`}
                    accountIdentifier={accountId}
                    orgIdentifier={orgIdentifier}
                    projectIdentifier={projectIdentifier}
                    onChange={(value, scope) => {
                      const connectorRefWithScope = getConnectorIdentifierWithScope(scope, value?.identifier)

                      formik.setFieldValue('connectorRef', connectorRefWithScope)
                      formik.setFieldValue?.('repo', '')
                    }}
                  />

                  <RepositorySelect
                    formikProps={formik}
                    selectedValue={get(formik.values, 'repo')}
                    connectorRef={get(formik.values, 'connectorRef')}
                    customClassName={css.width}
                  />
                  <Text tooltipProps={{ dataTooltipId: 'webhook-folder-path' }}>{`${getString(
                    'common.git.folderPath'
                  )} ${getString('optionalField')}`}</Text>
                  <FieldArray
                    name="folderPaths"
                    render={({ push, remove }) => {
                      const getDefaultResetValue = (): [{ id: string; value: string }] => {
                        return [{ id: uuid('', nameSpace()), value: '' }]
                      }
                      const value = get(formik.values, 'folderPaths', getDefaultResetValue())
                      return (
                        <>
                          {Array.isArray(value) &&
                            value.map(({ id }, index: number) => (
                              <Layout.Vertical key={id}>
                                <div className={css.group} key={id}>
                                  <Layout.Horizontal className={cx(css.width, css.folderPath)}>
                                    <div className={css.folderPathIndex}>{index + 1}.</div>
                                    <FormInput.Text
                                      name={`folderPaths[${index}].value`}
                                      label=""
                                      style={{ flexGrow: 1 }}
                                    />
                                  </Layout.Horizontal>
                                  {index !== 0 && (
                                    <Button
                                      icon="main-trash"
                                      iconProps={{ size: 20 }}
                                      minimal
                                      onClick={() => remove(index)}
                                      data-testid={`remove-folderPaths-[${index}]`}
                                    />
                                  )}
                                </div>
                                {index === value.length - 1 && get(formik.values, `folderPaths[${index}].value`, '') && (
                                  <Text padding={{ left: 'medium' }}>
                                    {getString('pipeline.webhooks.folderPathWithRepo', {
                                      repo: formik.values.repo,
                                      folderPath: get(formik.values, `folderPaths[${index}].value`, '')
                                    })}
                                  </Text>
                                )}
                              </Layout.Vertical>
                            ))}
                          <Button
                            intent="primary"
                            minimal
                            text={getString('plusAdd')}
                            data-testid={`add-folderPaths`}
                            onClick={() => push({ id: uuid('', nameSpace()), value: '' })}
                            className={css.addBtn}
                          />
                        </>
                      )
                    }}
                  />
                  <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      type="submit"
                      text={isEdit ? getString('save') : getString('add')}
                    />
                    <Button
                      variation={ButtonVariation.TERTIARY}
                      onClick={() => {
                        closeModal?.()
                      }}
                      text={getString('cancel')}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </Layout.Vertical>
            )}
          </Form>
        )
      }}
    </Formik>
  )
}
