/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { parse } from 'yaml'
import {
  Container,
  Formik,
  Card,
  Text,
  SelectOption,
  useToaster,
  Button,
  ButtonVariation,
  Layout
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { TemplateBar } from '@modules/70-pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { TemplateDTO, useUpdateMonitoredServiceFromYaml } from 'services/cv'
import {
  PreSelectedTemplate,
  useTemplateSelector
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { useStrings } from 'framework/strings'
import HealthSourceInputsetTable from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/HealthSourceInputset/components/HealthSourceInputsetTable/HealthSourceInputsetTable'
import HealthSourceInputsetForm from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/HealthSourceInputset/components/HealthSourceInputsetForm/HealthSourceInputsetForm'
import { getTemplatePromise, useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@modules/10-common/components/EntityReference/EntityReference'
import { ProjectPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { getGitQueryParamsWithParentScope } from '@modules/10-common/utils/gitSyncUtils'
import { TemplateType, TemplateUsage } from '@modules/72-templates-library/utils/templatesUtils'
import { MonitoredServiceInputSetInterface } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.types'
import { validateInputSet } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
import { yamlStringify } from '@modules/10-common/utils/YamlHelperMethods'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import NoResultsView from '@modules/72-templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { ChangeSourcetable } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/ChangeSourceInputset/ChangeSourcetable/ChangeSourcetable'
import { ChangeSourceInputsetForm } from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/ChangeSourceInputset/ChangeSourceInputsetForm/ChangeSourceInputsetForm'
import { StoreType } from '@modules/10-common/constants/GitSyncTypes'
import { useConfigurationContext } from '@cv/pages/monitored-service/components/Configurations/ConfigurationContext'
import MonitoredServiceInputsetVariables from '@modules/85-cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/MonitoredServiceInputsetVariables/MonitoredServiceInputsetVariables'
import {
  getHealthSourceWithName,
  getChangeSourceWithName,
  getInitialFormData
} from './ReconcileMonitoredServiceForm.utils'
import OrgAccountLevelServiceEnvField from '../MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import css from './MonitoredServiceReconcileList.module.scss'

export const ReconcileMonitoredServiceFormInMS = ({
  templateData,
  refetchReconileRequired,
  monitoredServiceIdentifier
}: {
  templateData: TemplateDTO
  monitoredServiceIdentifier: string
  refetchReconileRequired?: () => void
}): JSX.Element => {
  const pathParams = useParams<ProjectPathProps>()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = pathParams
  const { templateInputs = '' } = templateData
  const { getTemplate } = useTemplateSelector()
  const { getString } = useStrings()
  const { fetchMonitoredService } = useConfigurationContext()

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDTO>(templateData)
  const { templateRef, versionLabel = '' } = selectedTemplate

  const templateScope = getScopeFromValue(defaultTo(templateRef, ''))
  const templateIdentifier = getIdentifierFromValue(templateRef)

  const queryParams = {
    ...getScopeBasedProjectPathParams({ accountId, orgIdentifier, projectIdentifier }, templateScope),
    ...getGitQueryParamsWithParentScope({
      storeMetadata: {},
      params: pathParams,
      repoIdentifier: '',
      branch: ''
    }),
    versionLabel
  }

  const { data: templateInputYaml } = useGetTemplateInputSetYaml({
    templateIdentifier,
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    queryParams: {
      ...queryParams,
      getDefaultFromOtherRepo: true
    }
  })

  const { data: templateResponse } = useGetTemplate({
    templateIdentifier,
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    queryParams
  })

  const { mutate: saveReconcile, error: errorReconcile } = useUpdateMonitoredServiceFromYaml({
    identifier: monitoredServiceIdentifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const switchTemplateVersion = useCallback(
    async (selectedversion: string, selectedTemplateVer?: PreSelectedTemplate) => {
      return new Promise((resolve, reject) => {
        getTemplatePromise({
          templateIdentifier: selectedTemplateVer?.identifier || '',
          queryParams: {
            versionLabel: selectedversion,
            projectIdentifier: selectedTemplateVer?.projectIdentifier,
            orgIdentifier: selectedTemplateVer?.orgIdentifier,
            accountIdentifier: selectedTemplateVer?.accountId || '',
            ...(selectedTemplateVer?.storeType === StoreType.REMOTE
              ? { branch: selectedTemplateVer?.gitDetails?.branch }
              : {})
          },
          requestOptions: {
            headers:
              selectedTemplateVer?.storeType === StoreType.REMOTE
                ? {
                    'Load-From-Cache': 'true'
                  }
                : {}
          }
        })
          .then(async response => {
            if (response?.status === 'SUCCESS' && response?.data) {
              setSelectedTemplate({
                templateRef: response.data.identifier || '',
                versionLabel: response.data.versionLabel || ''
              })
              resolve(response?.data)
            } else {
              reject()
            }
          })
          .catch(() => {
            reject()
          })
      })
    },
    []
  )

  const templateValue = parse(templateResponse?.data?.yaml || '')?.template
  const healthSource = templateValue?.spec?.sources?.healthSources || []
  const changeSource = templateValue?.spec?.sources?.changeSources || []

  const { templateJSON, initialFormData } = getInitialFormData({ data: templateInputs }, templateInputYaml)

  const healthSourceWithName = getHealthSourceWithName(templateJSON, templateValue)
  const changeSourceSithName = getChangeSourceWithName(templateJSON, templateValue)

  return (
    <Container width={600}>
      <TemplateBar
        supportVersionChange
        templateLinkConfig={{ templateRef, versionLabel }}
        isReadonly={false}
        switchTemplateVersion={switchTemplateVersion}
        onOpenTemplateSelector={async () => {
          const { template } = await getTemplate({
            templateType: TemplateType.MonitoredService,
            allowedUsages: [TemplateUsage.USE],
            filterProperties: {
              templateIdentifiers: templateRef ? [templateRef] : []
            }
          })

          setSelectedTemplate({
            templateRef: template.identifier || '',
            versionLabel: template.versionLabel || ''
          })
        }}
      />
      {isEmpty(templateJSON) ? (
        <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
      ) : (
        <Formik<MonitoredServiceInputSetInterface>
          enableReinitialize
          formName={`reconcileMS_${versionLabel}}`}
          initialValues={initialFormData || {}}
          validate={value => validateInputSet(value as MonitoredServiceInputSetInterface, getString)}
          onSubmit={async value => {
            try {
              const populateVariables = value.variables ? { variables: value.variables } : {}
              const structure = {
                monitoredService: {
                  template: {
                    templateRef,
                    versionLabel,
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
              showSuccess(getString('cv.monitoredServices.ReconcileTab.reconcileSuccess'))
              fetchMonitoredService?.()
              refetchReconileRequired?.()
            } catch (_) {
              showError(getErrorMessage(errorReconcile))
            }
          }}
        >
          {formik => {
            return (
              <Container>
                <Card className={css.serviceEnvCardMs} color={Color.BLACK}>
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
                    isTemplate={false}
                    serviceOnSelect={(selectedService: SelectOption) => {
                      formik.setFieldValue('serviceRef', selectedService?.value)
                    }}
                    environmentOnSelect={(selectedEnv: SelectOption) => {
                      formik.setFieldValue('environmentRef', selectedEnv?.value)
                    }}
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
                  <ChangeSourcetable changeSources={changeSource} />
                  <ChangeSourceInputsetForm
                    isReconcile
                    isReadOnlyInputSet={false}
                    changeSources={changeSourceSithName}
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
                  <HealthSourceInputsetTable healthSources={healthSource} />
                  <HealthSourceInputsetForm
                    healthSources={healthSourceWithName}
                    isReadOnlyInputSet={false}
                    isReconcile
                  />
                </Card>
                <MonitoredServiceInputsetVariables monitoredServiceVariables={templateJSON?.variables} />
                <Layout.Horizontal flex={{ justifyContent: 'space-evenly' }} margin={{ bottom: 'large' }}>
                  <Button
                    width="25%"
                    margin={{ top: 'small' }}
                    variation={ButtonVariation.PRIMARY}
                    onClick={() => formik.submitForm()}
                    data-testid="reconcileButton"
                  >
                    {getString('pipeline.outOfSyncErrorStrip.reconcile')}
                  </Button>
                  <Button
                    width="25%"
                    margin={{ top: 'small' }}
                    variation={ButtonVariation.SECONDARY}
                    onClick={() => formik.resetForm()}
                    data-testid="reconcileButton"
                  >
                    {getString('common.discard')}
                  </Button>
                </Layout.Horizontal>
              </Container>
            )
          }}
        </Formik>
      )}
    </Container>
  )
}
