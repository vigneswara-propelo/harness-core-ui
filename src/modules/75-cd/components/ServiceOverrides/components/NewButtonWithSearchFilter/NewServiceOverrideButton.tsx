import React from 'react'
import { Button } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useServiceOverridesContext } from '../../context/ServiceOverrideContext'

export default function NewServiceOverrideButton(): React.ReactElement {
  const { getString } = useStrings()
  const { handleNewOverride } = useServiceOverridesContext()

  return (
    <Button
      intent="primary"
      icon="plus"
      text={getString('common.serviceOverrides.newOverride')}
      data-testid="add-service-override"
      onClick={handleNewOverride}
    />
  )
}
