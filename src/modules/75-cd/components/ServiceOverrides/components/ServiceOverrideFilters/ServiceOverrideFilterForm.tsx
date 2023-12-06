/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'

import { FormInput, SelectOption } from '@harness/uicore'

import { useStrings } from 'framework/strings'

interface ServiceOverrideFilterFormProps {
  environments?: SelectOption[]
  services?: SelectOption[]
  infrastructures?: SelectOption[]
}

export default function ServiceOverrideFilterForm({
  environments,
  services,
  infrastructures
}: ServiceOverrideFilterFormProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <>
      <FormInput.MultiSelect
        items={defaultTo(environments, [])}
        name="environments"
        label={getString('environments')}
        placeholder={getString('pipeline.filters.environmentPlaceholder')}
        key="environments"
        multiSelectProps={{
          allowCreatingNewItems: false,
          resetOnSelect: false,
          resetOnQuery: false
        }}
      />
      <FormInput.MultiSelect
        items={defaultTo(services, [])}
        name="services"
        label={getString('services')}
        placeholder={getString('pipeline.filters.servicePlaceholder')}
        key="services"
        multiSelectProps={{
          allowCreatingNewItems: false,
          resetOnSelect: false,
          resetOnQuery: false
        }}
      />
      <FormInput.MultiSelect
        items={defaultTo(infrastructures, [])}
        name="infrastructures"
        label={getString('common.infrastructures')}
        placeholder={getString('cd.serviceOverrides.searchOrSelectInfrastructure')}
        key="infrastructures"
        multiSelectProps={{
          allowCreatingNewItems: false,
          resetOnSelect: false,
          resetOnQuery: false
        }}
      />
    </>
  )
}
