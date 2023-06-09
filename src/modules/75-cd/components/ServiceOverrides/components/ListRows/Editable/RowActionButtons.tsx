import React from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'

export default function RowActionButtons(): React.ReactElement {
  const { onDiscard } = useServiceOverridesContext()

  return (
    <Layout.Horizontal spacing={'medium'}>
      <Button icon="tick" variation={ButtonVariation.ICON} type="submit" color={Color.PRIMARY_7} />
      <Button icon="cross" variation={ButtonVariation.ICON} onClick={() => onDiscard()} color={Color.PRIMARY_7} />
    </Layout.Horizontal>
  )
}
