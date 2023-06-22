import React from 'react'

import { Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { useServiceOverridesContext } from '../context/ServiceOverrideContext'
import { noOverridesStringMap } from '../ServiceOverridesUtils'
import NewServiceOverrideButton from './NewButtonWithSearchFilter/NewServiceOverrideButton'
import NoServiceOverrideImg from './NoServiceOverride.svg'

import css from '../ServiceOverrides.module.scss'

export default function NoServiceOverrides(): React.ReactElement {
  const { getString } = useStrings()
  const { serviceOverrideType } = useServiceOverridesContext()

  return (
    <Layout.Vertical
      flex={{ justifyContent: 'center', alignItems: 'center' }}
      spacing={'medium'}
      padding={{ right: 'xlarge', left: 'xlarge' }}
      className={css.noServiceOverrideContainer}
    >
      <img src={NoServiceOverrideImg} width={230} height={140} />
      <Text>{getString(noOverridesStringMap[serviceOverrideType])}</Text>
      <NewServiceOverrideButton />
    </Layout.Vertical>
  )
}
