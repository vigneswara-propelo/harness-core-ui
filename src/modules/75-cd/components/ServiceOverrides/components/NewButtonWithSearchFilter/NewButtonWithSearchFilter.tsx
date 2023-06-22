import React from 'react'
import { Layout } from '@harness/uicore'
import NewServiceOverrideButton from './NewServiceOverrideButton'

export default function NewButtonWithSearchFilter(): React.ReactElement {
  return (
    <Layout.Horizontal
      border={{ bottom: true }}
      padding={{ bottom: 'medium' }}
      margin={{ right: 'xlarge', left: 'xlarge' }}
    >
      <NewServiceOverrideButton />
    </Layout.Horizontal>
  )
}
