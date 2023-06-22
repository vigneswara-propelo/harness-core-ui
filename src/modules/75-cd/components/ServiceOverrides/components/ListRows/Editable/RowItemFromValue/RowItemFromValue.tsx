import React from 'react'

import type { StringKeys } from 'framework/strings'

import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import type { ServiceOverrideRowFormState } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'
import { serviceOverridesConfig } from '@cd/components/ServiceOverrides/ServiceOverridesConfig'

import OverrideTypeInput from '../OverrideTypeInput'
import InfrastructureSelect from './InfrastructureSelect'
import ScopedEntitySelect from './ScopedEntitySelect/ScopedEntitySelect'

export default function RowItemFromValue({
  value,
  isEdit,
  isClone,
  readonly
}: {
  value: StringKeys
  isEdit: boolean
  isClone: boolean
  readonly?: boolean
}): React.ReactElement {
  const { serviceOverrideType } = useServiceOverridesContext()
  const overrideConfig = serviceOverridesConfig[serviceOverrideType]

  if (value === 'environment') {
    return (
      <ScopedEntitySelect<ServiceOverrideRowFormState>
        fieldKey="environmentRef"
        readonly={readonly || (isEdit && !isClone)}
        width={overrideConfig.find(conf => conf.accessKey === 'environmentRef')?.rowWidth}
      />
    )
  } else if (value === 'service') {
    return (
      <ScopedEntitySelect<ServiceOverrideRowFormState>
        fieldKey="serviceRef"
        readonly={readonly || (isEdit && !isClone)}
        width={overrideConfig.find(conf => conf.accessKey === 'serviceRef')?.rowWidth}
      />
    )
  } else if (value === 'infrastructureText') {
    return <InfrastructureSelect readonly={readonly || (isEdit && !isClone)} />
  } else {
    return <OverrideTypeInput readonly={readonly || (isEdit && !isClone)} />
  }
}
