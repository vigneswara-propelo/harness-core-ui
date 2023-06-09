import React from 'react'

import type { StringKeys } from 'framework/strings'

import type { ServiceOverrideRowFormState } from '@cd/components/ServiceOverrides/ServiceOverridesUtils'

import OverrideTypeInput from '../OverrideTypeInput'
import InfrastructureSelect from './InfrastructureSelect'
import ScopedEntitySelect from './ScopedEntitySelect/ScopedEntitySelect'

export default function RowItemFromValue({
  value,
  readonly,
  isEdit
}: {
  value: StringKeys
  isEdit: boolean
  readonly?: boolean
}): React.ReactElement {
  if (value === 'environment') {
    return <ScopedEntitySelect<ServiceOverrideRowFormState> fieldKey="environmentRef" readonly={readonly || isEdit} />
  } else if (value === 'service') {
    return <ScopedEntitySelect<ServiceOverrideRowFormState> fieldKey="serviceRef" readonly={readonly || isEdit} />
  } else if (value === 'infrastructureText') {
    return <InfrastructureSelect readonly={readonly || isEdit} />
  } else {
    return <OverrideTypeInput readonly={readonly || isEdit} />
  }
}
