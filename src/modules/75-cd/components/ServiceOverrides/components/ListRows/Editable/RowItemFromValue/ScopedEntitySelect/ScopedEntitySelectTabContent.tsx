import React from 'react'

import type { SelectOption } from '@harness/uicore'

import type { Scope } from '@common/interfaces/SecretsInterface'

import type { ScopedEntitySelectProps } from './ScopedEntitySelect'
import EnvironmentEntityList from './EnvironmentEntityList'
import ServiceEntityList from './ServiceEntityList'

export default function ScopedEntitySelectTabContent({
  fieldKey,
  onSelect,
  scope
}: {
  fieldKey: ScopedEntitySelectProps['fieldKey']
  onSelect(option: SelectOption): void
  scope?: Scope
}): React.ReactElement {
  return (
    <>
      {fieldKey === 'environmentRef' && <EnvironmentEntityList onSelect={onSelect} scope={scope} />}
      {fieldKey === 'serviceRef' && <ServiceEntityList onSelect={onSelect} scope={scope} />}
    </>
  )
}
