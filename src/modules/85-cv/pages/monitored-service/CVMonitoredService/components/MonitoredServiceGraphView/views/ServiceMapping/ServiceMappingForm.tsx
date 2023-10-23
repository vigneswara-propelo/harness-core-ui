/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, Layout, Formik, FormikForm, FormInput, ButtonVariation, useToaster } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useListAgent } from 'services/servicediscovery'
import { AutoDiscoveryRequestDTO, AutoDiscoveryResponseDTO, useCreateAutoDiscovery } from 'services/cv'
import { getErrorMessage } from '@modules/85-cv/utils/CommonUtils'
import { validateServiceMappingForm } from './ServiceMapping.utils'
import { ServiceMappingFields } from './ServiceMapping.constant'
import css from './ServiceMapping.module.scss'

interface ServiceMappingFormProps {
  onCancel: () => void
  onSubmit: (data: AutoDiscoveryResponseDTO) => void
}

const ServiceMappingForm = ({ onCancel, onSubmit }: ServiceMappingFormProps): JSX.Element => {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const {
    mutate: mutateCreateAutoDiscovery,
    loading: loadingCreateAutoDiscovery,
    error: errorCreateAutoDiscovery
  } = useCreateAutoDiscovery({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const {
    data: discoveryAgentList,
    loading: discoveryAgentListLoading,
    error: discoveryAgentListError
  } = useListAgent({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      all: true,
      page: 0,
      limit: 0
    }
  })

  if (discoveryAgentListError) {
    showError(getErrorMessage(discoveryAgentListError))
  }

  const discoveryAgentSelectOption =
    discoveryAgentList?.items?.map(item => {
      return {
        label: item.name || '',
        value: item.identity || ''
      }
    }) || []

  return (
    <Container className={css.serviceMappingform}>
      <Formik<AutoDiscoveryRequestDTO>
        formName="errorBudgetReset"
        initialValues={{
          agentIdentifier: '',
          autoCreateMonitoredService: false
        }}
        onSubmit={async data => {
          try {
            const { resource } = await mutateCreateAutoDiscovery(data)
            showSuccess('Service mappings imported successfully')
            onSubmit({ ...resource })
          } catch (_) {
            showError(getErrorMessage(errorCreateAutoDiscovery))
          }
        }}
        validate={data => validateServiceMappingForm(data, getString)}
      >
        {formik => (
          <FormikForm>
            <FormInput.Select
              disabled={loadingCreateAutoDiscovery}
              className={css.mappingDropdown}
              name={ServiceMappingFields.AgentIdentifier}
              data-testid="discoveryAgentDropdown"
              items={discoveryAgentSelectOption}
              placeholder={discoveryAgentListLoading ? getString('common.loading') : ''}
              label={getString('discovery.discoveryDetails.settings.agentName')}
            />
            <FormInput.CheckBox
              name={ServiceMappingFields.AutoCreateMonitoredService}
              data-testid="autoCreateCheckbox"
              label={getString('cv.monitoredServices.importServiceMapping.form.autoCreateCheckbox')}
            />
            <Layout.Horizontal spacing="large" margin={{ top: 'xxlarge' }}>
              <Button
                loading={loadingCreateAutoDiscovery}
                onClick={() => formik.submitForm()}
                variation={ButtonVariation.PRIMARY}
                data-testid="submitFormButton"
              >
                {getString('submit')}
              </Button>
              <Button variation={ButtonVariation.SECONDARY} onClick={onCancel} data-testid="closeFormButton">
                {getString('cancel')}
              </Button>
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default ServiceMappingForm
