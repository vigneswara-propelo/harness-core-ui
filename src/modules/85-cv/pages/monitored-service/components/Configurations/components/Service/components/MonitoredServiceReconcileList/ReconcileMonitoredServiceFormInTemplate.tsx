/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Formik,
  Layout,
  Text,
  Button,
  ButtonVariation,
  Card,
  SelectOption,
  useToaster,
  Page
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { useGetMonitoredServiceResolvedTemplateInputs, useUpdateMonitoredServiceFromYaml } from 'services/cv'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import HealthSourceInputsetTable from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/HealthSourceInputset/components/HealthSourceInputsetTable/HealthSourceInputsetTable'
import HealthSourceInputsetForm from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/HealthSourceInputset/components/HealthSourceInputsetForm/HealthSourceInputsetForm'
import { yamlStringify } from '@modules/10-common/utils/YamlHelperMethods'
import { NGTemplateInfoConfig, useGetTemplateInputSetYaml } from 'services/template-ng'
import { validateInputSet } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
import { MonitoredServiceInputSetInterface } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.types'
import {
  getScopeBasedProjectPathParams,
  getScopeFromDTO
} from '@modules/10-common/components/EntityReference/EntityReference'
import { ChangeSourcetable } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/ChangeSourceInputset/ChangeSourcetable/ChangeSourcetable'
import { ChangeSourceInputsetForm } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/ChangeSourceInputset/ChangeSourceInputsetForm/ChangeSourceInputsetForm'
import MonitoredServiceInputsetVariables from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/MonitoredServiceInputsetVariables/MonitoredServiceInputsetVariables'
import OrgAccountLevelServiceEnvField from '../MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import {
  getChangeSourceWithName,
  getHealthSourceWithName,
  getInitialFormData
} from './ReconcileMonitoredServiceForm.utils'
import css from './MonitoredServiceReconcileList.module.scss'

export default function ReconcileMonitoredServiceFormInTemplate({
  closeDrawer,
  templateValue,
  monitoredServiceIdentifier
}: {
  templateValue: NGTemplateInfoConfig
  monitoredServiceIdentifier: string
  closeDrawer: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { identifier, versionLabel, orgIdentifier: templateOrgId, projectIdentifier: templateProjectId } = templateValue
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const templateRefScope = getScopeFromDTO({
    accountIdentifier: accountId,
    orgIdentifier: templateOrgId,
    projectIdentifier: templateProjectId
  })

  const {
    data: resolvedTemplateData,
    loading: msTemplateLoading,
    error: msTemplateError,
    refetch: msTemplateRefetch
  } = useGetMonitoredServiceResolvedTemplateInputs({
    identifier: monitoredServiceIdentifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      templateIdentifier: identifier,
      versionLabel
    }
  })

  const {
    data: templateInputYaml,
    loading: loadingTemplateYaml,
    error: errorTemplateYaml,
    refetch: refetchTemplateInputYaml
  } = useGetTemplateInputSetYaml({
    templateIdentifier: defaultTo(templateValue?.identifier, ''),
    queryParams: {
      ...getScopeBasedProjectPathParams(
        {
          accountId,
          orgIdentifier: templateOrgId || '',
          projectIdentifier: templateProjectId || ''
        },
        templateRefScope
      ),
      versionLabel: defaultTo(versionLabel, ''),
      getDefaultFromOtherRepo: true
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  const { mutate: saveReconcile, error: errorReconcile } = useUpdateMonitoredServiceFromYaml({
    identifier: monitoredServiceIdentifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { templateJSON, initialFormData } = getInitialFormData(resolvedTemplateData, templateInputYaml)

  const healthSourceWithName = getHealthSourceWithName(templateJSON, templateValue)
  const changeSourceWithName = getChangeSourceWithName(templateJSON, templateValue)

  return (
    <Page.Body
      loading={msTemplateLoading || loadingTemplateYaml}
      error={getErrorMessage(msTemplateError) || getErrorMessage(errorTemplateYaml)}
      retryOnError={() => {
        msTemplateError && msTemplateRefetch()
        errorTemplateYaml && refetchTemplateInputYaml()
      }}
    >
      <Container>
        {isEmpty(templateJSON) ? (
          <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
        ) : (
          <Formik<MonitoredServiceInputSetInterface>
            formName="MonitoredServiceForm"
            onSubmit={async value => {
              try {
                const populateVariables = value.variables ? { variables: value.variables } : {}
                const structure = {
                  monitoredService: {
                    template: {
                      templateRef: identifier,
                      versionLabel: versionLabel,
                      isTemplateByReference: true,
                      templateInputs: {
                        ...value,
                        sources: value?.sources,
                        ...populateVariables
                      }
                    }
                  }
                }
                const yamlResponse = yamlStringify(structure)
                await saveReconcile(yamlResponse)
                closeDrawer()
                showSuccess(getString('cv.monitoredServices.ReconcileTab.reconcileSuccess'))
              } catch (error) {
                showError(getErrorMessage(errorReconcile))
              }
            }}
            initialValues={initialFormData}
            enableReinitialize
            validate={value => validateInputSet(value as MonitoredServiceInputSetInterface, getString)}
          >
            {formik => {
              return (
                <>
                  <Layout.Horizontal
                    className={css.reconcileDrawerHeader}
                    border={{ bottom: true }}
                    margin={{ bottom: 'small' }}
                    padding={{ bottom: 'small' }}
                  >
                    <Text font={{ variation: FontVariation.H4 }}>{getString('edit')}</Text>
                    <Layout.Horizontal spacing={'medium'}>
                      <Button
                        data-testid="reconcileButton"
                        variation={ButtonVariation.PRIMARY}
                        onClick={() => formik.submitForm()}
                      >
                        {getString('pipeline.outOfSyncErrorStrip.reconcile')}
                      </Button>
                      <Button
                        data-testid="discardButton"
                        variation={ButtonVariation.TERTIARY}
                        onClick={() => formik.resetForm()}
                      >
                        {getString('common.discard')}
                      </Button>
                    </Layout.Horizontal>
                  </Layout.Horizontal>
                  <Card className={css.serviceEnvCard} color={Color.BLACK}>
                    <Text
                      font={{ variation: FontVariation.CARD_TITLE }}
                      color={Color.BLACK}
                      style={{ paddingBottom: 'var(--spacing-medium)' }}
                    >
                      {getString('cv.monitoredServices.ReconcileTab.serviceAndenv')}
                    </Text>
                    <OrgAccountLevelServiceEnvField
                      isInputSet
                      noHeaderLabel
                      isTemplate={true}
                      serviceOnSelect={(selectedService: SelectOption) =>
                        formik.setFieldValue('serviceRef', selectedService.value)
                      }
                      environmentOnSelect={(selectedEnv: SelectOption) =>
                        formik.setFieldValue('environmentRef', selectedEnv.value)
                      }
                    />
                  </Card>
                  <Card className={css.healthsourceCard}>
                    <Text
                      font={{ variation: FontVariation.CARD_TITLE }}
                      color={Color.BLACK}
                      style={{ paddingBottom: 'var(--spacing-medium)' }}
                    >
                      {getString('cv.changesPage.changeSourceDetails')}
                    </Text>
                    <ChangeSourcetable changeSources={templateValue?.spec?.sources?.changeSources || []} />
                    <ChangeSourceInputsetForm
                      isReconcile
                      isReadOnlyInputSet={false}
                      changeSources={changeSourceWithName}
                    />
                  </Card>
                  <Card className={css.healthsourceCard}>
                    <Text
                      font={{ variation: FontVariation.CARD_TITLE }}
                      color={Color.BLACK}
                      style={{ paddingBottom: 'var(--spacing-medium)' }}
                    >
                      {getString('cv.templates.healthSourceDetails')}
                    </Text>
                    <HealthSourceInputsetTable healthSources={templateValue?.spec?.sources?.healthSources || []} />
                    <HealthSourceInputsetForm
                      healthSources={healthSourceWithName}
                      isReadOnlyInputSet={false}
                      isReconcile
                    />
                  </Card>
                  <MonitoredServiceInputsetVariables monitoredServiceVariables={templateJSON?.variables} />
                </>
              )
            }}
          </Formik>
        )}
      </Container>
    </Page.Body>
  )
}
