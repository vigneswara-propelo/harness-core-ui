import React from 'react'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './ConfiguredLabel.module.scss'

interface ConfiguredLabelProps {
  count: number
}

export default function ConfiguredLabel(props: ConfiguredLabelProps): JSX.Element {
  const { getString } = useStrings()
  const { count } = props
  if (count === 0) {
    return (
      <Text className={css.notConfiguredLabel} font={{ weight: 'bold', size: 'small' }} color={Color.GREY_700}>
        {getString('cv.commonMonitoredServices.notConfigured').toLocaleUpperCase()}
      </Text>
    )
  } else {
    return (
      <Text
        className={css.configuredLabel}
        font={{ weight: 'bold', size: 'small' }}
        color={Color.PRIMARY_7}
      >{`${getString('cv.commonMonitoredServices.configured').toLocaleUpperCase()} (${count})`}</Text>
    )
  }
}
