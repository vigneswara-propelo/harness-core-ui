/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { Layout, FormInput, useConfirmationDialog, Text, Container } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import type { MonitoredServiceDTO } from 'services/cv'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import { useMonitoredServiceContext } from '@cv/pages/monitored-service/MonitoredServiceContext'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import { getIfModuleIsCD } from '@cv/components/MonitoredServiceListWidget/MonitoredServiceListWidget.utils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { MonitoredServiceTypeOptions } from './MonitoredServiceOverview.constants'
import { updatedMonitoredServiceNameForEnv, serviceOnSelect } from './MonitoredServiceOverview.utils'
import type { MonitoredServiceOverviewProps } from './MonitoredSourceOverview.types'
import OrgAccountLevelServiceEnvField from './component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import css from './MonitoredServiceOverview.module.scss'

export default function MonitoredServiceOverview(props: MonitoredServiceOverviewProps): JSX.Element {
  const { formikProps, isEdit, onChangeMonitoredServiceType, config, serviceIdentifier, environmentIdentifier } = props
  const { isTemplate } = useMonitoredServiceContext()
  const { getString } = useStrings()
  const [tempServiceType, setTempServiceType] = useState<MonitoredServiceDTO['type']>()
  const isCDModule = getIfModuleIsCD(config)
  const { licenseInformation } = useLicenseStore()
  const isSRMLicensePresentAndActive = licenseInformation[ModuleName.CV]?.status === LICENSE_STATE_VALUES.ACTIVE

  const { templateIdentifier } = useParams<{ templateIdentifier: string }>()

  const isTemplateAndEdit = isTemplate && Boolean(templateIdentifier) && templateIdentifier !== '-1'

  const { openDialog } = useConfirmationDialog({
    contentText: getString('cv.monitoredServices.changeMonitoredServiceTypeMessage'),
    titleText: getString('cv.monitoredServices.changeMonitoredServiceType'),
    cancelButtonText: getString('cancel'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        /*
         * Resetting environmentRef to undefined will prevent UI from breaking,
         * as Application and Infrastructure types needs different
         * data structure for environmentRef
         */

        formikProps.setFieldValue('environmentRef', undefined)
        onChangeMonitoredServiceType?.(tempServiceType as MonitoredServiceDTO['type'])
      }
    }
  })
  const onEnvSelect = useCallback(
    environment => updatedMonitoredServiceNameForEnv(formikProps, environment, formikProps.values?.type),
    [formikProps.values]
  )

  const onServiceSelect = useCallback(
    service => serviceOnSelect(isTemplate, service, formikProps),
    [formikProps.values]
  )

  useEffect(() => {
    if (serviceIdentifier && environmentIdentifier) {
      formikProps.setFieldValue('serviceRef', serviceIdentifier)
      formikProps.setFieldValue('environmentRef', environmentIdentifier)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceIdentifier, environmentIdentifier])

  return (
    <CardWithOuterTitle className={css.monitoredService}>
      {!isEdit ? (
        <Layout.Vertical spacing="large">
          <Layout.Vertical>
            <Text
              font={{ weight: 'semi-bold', size: 'medium' }}
              color={Color.BLACK}
              padding={{ bottom: 'small' }}
              lineClamp={1}
            >
              {getString('cv.monitoredServices.defineServiceEnvironment')}
            </Text>
            <Text lineClamp={1}>{getString('cv.monitoredServices.defineServiceEnvironmentDescription')}</Text>
          </Layout.Vertical>
          {isCDModule || !isSRMLicensePresentAndActive ? null : (
            <FormInput.Select
              name="type"
              disabled={isTemplateAndEdit}
              tooltipProps={{ dataTooltipId: 'monitoredServiceType' }}
              items={MonitoredServiceTypeOptions}
              label={getString('common.serviceType')}
              value={
                formikProps.values?.type === 'Infrastructure'
                  ? MonitoredServiceTypeOptions[1]
                  : MonitoredServiceTypeOptions[0]
              }
              onChange={item => {
                if (formikProps.values.type !== item.value) {
                  openDialog()
                  formikProps.setFieldValue('type', formikProps.values.type)
                  setTempServiceType(item.value as MonitoredServiceDTO['type'])
                }
              }}
              className={css.dropdown}
            />
          )}

          <OrgAccountLevelServiceEnvField
            isTemplate={isTemplate}
            environmentOnSelect={onEnvSelect}
            serviceOnSelect={onServiceSelect}
          />
          {!isTemplate && <hr className={css.divider} />}
        </Layout.Vertical>
      ) : null}
      {!isTemplate && (
        <Container className={css.monitoredServiceContainer}>
          <NameIdDescriptionTags
            formikProps={formikProps}
            inputGroupProps={{
              disabled: formikProps.values?.type === ChangeSourceCategoryName.INFRASTRUCTURE ? false : true
            }}
            className={css.nameTagsDescription}
            identifierProps={{
              isIdentifierEditable: formikProps.values?.type === ChangeSourceCategoryName.INFRASTRUCTURE ? true : false,
              inputLabel: getString('cv.monitoredServices.monitoredServiceName')
            }}
            tooltipProps={{ dataTooltipId: 'NameIdDescriptionTagsHealthSource' }}
          />
        </Container>
      )}
    </CardWithOuterTitle>
  )
}
