/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, FormInput, Formik, Layout, Text, Icon } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { FieldArray, Form, FormikProps } from 'formik'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import { useCreateGitxWebhookMutation, useUpdateGitxWebhookMutation } from '@harnessio/react-ng-manager-client'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import ConnectorReferenceField from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import RepositorySelect from '@common/components/RepositorySelect/RepositorySelect'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getSupportedProviders } from '@gitsync/components/GitSyncForm/GitSyncForm'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getConnectorIdentifierWithScope } from '@platform/connectors/utils/utils'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { AddWebhookModalData, NewWebhookModalProps } from './utils'
import css from './Webhooks.module.scss'

export default function NewWebhookModal(props: NewWebhookModalProps): JSX.Element {
  const { initialData, entityScope = Scope.ACCOUNT, isEdit, closeModal } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const formikRef = React.useRef<FormikProps<AddWebhookModalData>>()

  const { data, isLoading: loading, mutate: createWebhook } = useCreateGitxWebhookMutation({})

  const {
    data: webhookUpdateData,
    isLoading: loadingUpdateWebhook,
    mutate: updateWebhook
  } = useUpdateGitxWebhookMutation({})

  function handleSubmit(values: AddWebhookModalData): void {
    const folder_paths = values.folderPaths.map(path => path.value)

    isEdit
      ? updateWebhook({
          'gitx-webhook': values.identifier,
          body: {
            connector_ref: values.connectorRef,
            folder_paths: folder_paths,
            repo_name: values.repo,
            webhook_name: values.name
          }
        })
      : createWebhook({
          body: {
            connector_ref: values.connectorRef,
            folder_paths: folder_paths,
            repo_name: values.repo,
            webhook_identifier: values.identifier,
            webhook_name: values.name
          }
        })
  }

  if (loading || loadingUpdateWebhook) {
    return <ContainerSpinner message={getString('cd.webhooks.settingUpWebhook')} />
  }

  if (data || webhookUpdateData) {
    return (
      <Layout.Vertical flex={{ alignItems: 'center' }}>
        <Icon name="success-tick" size={34} padding={'small'} />
        <Text font={{ variation: FontVariation.H3 }} padding={'medium'}>
          {getString(isEdit ? 'cd.webhooks.successUpdateMessage' : 'cd.webhooks.successMessage', {
            name: get(formikRef.current?.values, 'name', '')
          })}
        </Text>
        <Text font={{ variation: FontVariation.BODY }} padding={'small'}>
          {getString('cd.webhooks.successSubtitle')}
        </Text>
      </Layout.Vertical>
    )
  }

  return (
    <Formik<AddWebhookModalData> initialValues={initialData} formName="addWebhookModalData" onSubmit={handleSubmit}>
      {formik => {
        formikRef.current = formik
        return (
          <Form>
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
                type={getSupportedProviders()}
                selected={get(formik.values, 'connectorRef')}
                error={formik.submitCount > 0 ? (formik.errors?.connectorRef as string) : undefined}
                label={getString('platform.connectors.title.gitConnector')}
                placeholder={`- ${getString('select')} -`}
                accountIdentifier={accountId}
                {...(entityScope === Scope.ACCOUNT ? {} : { orgIdentifier })}
                {...(entityScope === Scope.PROJECT ? { projectIdentifier } : {})}
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
              <Text>{getString('common.git.folderPath')}</Text>
              <FieldArray
                name="folderPaths"
                render={({ push, remove }) => {
                  const getDefaultResetValue = () => {
                    return [{ id: uuid('', nameSpace()), value: '' }]
                  }
                  const value = get(formik.values, 'folderPaths', getDefaultResetValue())
                  return (
                    <>
                      {Array.isArray(value) &&
                        value.map(({ id }, index: number) => (
                          <div className={css.group} key={id}>
                            <Layout.Horizontal className={cx(css.width, css.folderPath)}>
                              <div className={css.paddingRight}>{index + 1}.</div>
                              <FormInput.Text name={`folderPaths[${index}].value`} label="" style={{ flexGrow: 1 }} />
                            </Layout.Horizontal>
                            <Button
                              icon="main-trash"
                              iconProps={{ size: 20 }}
                              minimal
                              onClick={() => remove(index)}
                              data-testid={`remove-folderPaths-[${index}]`}
                            />
                          </div>
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
          </Form>
        )
      }}
    </Formik>
  )
}
