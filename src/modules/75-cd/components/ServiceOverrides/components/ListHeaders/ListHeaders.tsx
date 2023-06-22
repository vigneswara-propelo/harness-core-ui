import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import { serviceOverridesConfig } from '@cd/components/ServiceOverrides/ServiceOverridesConfig'
import css from './ListHeaders.module.scss'

export default function ListHeaders(): React.ReactElement {
  const { getString } = useStrings()
  const { serviceOverrideType } = useServiceOverridesContext()
  const headerConfigs = serviceOverridesConfig[serviceOverrideType]

  return (
    <Layout.Horizontal
      margin={{ top: 'large', bottom: 'medium', left: 'large' }}
      padding={{ right: 'xlarge', left: 'xlarge' }}
    >
      {headerConfigs.map(headerConfig => {
        if (headerConfig.value === 'common.serviceOverrides.overrideInfo') {
          return (
            <Text
              key={headerConfig.value}
              font={{ variation: FontVariation.TABLE_HEADERS }}
              border={{ left: true }}
              padding={{ left: 'medium' }}
              className={css.overrideInfoHeader}
            >
              {getString(headerConfig.value).toUpperCase()}
            </Text>
          )
        }
        return (
          <Text
            key={headerConfig.value}
            width={headerConfig.headerWidth}
            font={{ variation: FontVariation.TABLE_HEADERS }}
          >
            {getString(headerConfig.value).toUpperCase()}
          </Text>
        )
      })}
    </Layout.Horizontal>
  )
}
