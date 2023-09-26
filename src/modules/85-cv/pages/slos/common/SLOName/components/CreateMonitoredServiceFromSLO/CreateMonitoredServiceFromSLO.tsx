/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import type { FormikProps } from 'formik'
import { Button, ButtonVariation, Layout, SelectOption, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import {
  updatedMonitoredServiceNameForEnv,
  updateMonitoredServiceNameForService
} from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.utils'
import OrgAccountLevelServiceEnvField from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField'
import { useStrings } from 'framework/strings'
import { SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { useCreateDefaultMonitoredService } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ServiceAndEnv } from '../../SLOName.types'

interface CreateMonitoredServiceFromSLOProps {
  monitoredServiceFormikProps: FormikProps<ServiceAndEnv>
  setFieldForSLOForm: (field: string, value: unknown) => void
  fetchingMonitoredServices: () => void
  hideModal: () => void
}

export default function CreateMonitoredServiceFromSLO(props: CreateMonitoredServiceFromSLOProps): JSX.Element {
  const { monitoredServiceFormikProps, fetchingMonitoredServices, hideModal, setFieldForSLOForm } = props
  const { serviceRef, environmentRef } = monitoredServiceFormikProps.values || {}
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()

  const createServiceQueryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier: environmentRef,
      serviceIdentifier: serviceRef
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentRef, serviceRef])

  const { mutate: createDefaultMonitoredService, loading: createMonitoredServiceLoading } =
    useCreateDefaultMonitoredService({
      queryParams: createServiceQueryParams
    })

  const onSelect = useCallback(
    environment =>
      updatedMonitoredServiceNameForEnv(
        monitoredServiceFormikProps,
        environment,
        monitoredServiceFormikProps.values?.type
      ),
    [monitoredServiceFormikProps]
  )

  const handleCreateMonitoredService = async (): Promise<void> => {
    try {
      // creating the new monitored service
      const createdMonitoredService = await createDefaultMonitoredService()

      // selecting the current monitored service
      setFieldForSLOForm(
        SLOV2FormFields.MONITORED_SERVICE_REF,
        createdMonitoredService?.resource?.monitoredService?.identifier
      )

      // listing all the monitored services
      fetchingMonitoredServices()

      showSuccess(getString('cv.monitoredServices.monitoredServiceCreated'))
      hideModal()
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  return (
    <>
      <OrgAccountLevelServiceEnvField
        isTemplate={false}
        serviceOnSelect={(selectedService: SelectOption) =>
          updateMonitoredServiceNameForService(monitoredServiceFormikProps, selectedService)
        }
        environmentOnSelect={(selectedEnv: SelectOption) => onSelect(selectedEnv)}
      />
      <Layout.Horizontal spacing="small">
        <Button
          variation={ButtonVariation.PRIMARY}
          text={getString('save')}
          disabled={createMonitoredServiceLoading}
          onClick={handleCreateMonitoredService}
        />
        <Button text={getString('cancel')} onClick={hideModal} variation={ButtonVariation.TERTIARY} />
      </Layout.Horizontal>
    </>
  )
}
