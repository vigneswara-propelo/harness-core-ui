import { Button, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'

import React from 'react'
import { Link } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import css from './ConfigureMonitoredServiceDetails.module.scss'

interface ConfigureMonitoredServiceDetailsProps {
  linkTo: string
  detailToConfigureText: string
  refetchDetails: () => Promise<void>
}

export default function ConfigureMonitoredServiceDetails(props: ConfigureMonitoredServiceDetailsProps): JSX.Element {
  const { linkTo, detailToConfigureText, refetchDetails } = props
  const { getString } = useStrings()

  return (
    <Layout.Horizontal padding={{ top: 'medium' }}>
      <Button
        variation={ButtonVariation.LINK}
        text={getString('common.refresh')}
        font={{ weight: 'semi-bold', size: 'normal' }}
        className={css.refreshBtn}
        onClick={() => refetchDetails()}
      />
      <Link to={linkTo} target="_blank" className={css.createMonService}>
        <Layout.Horizontal spacing="small">
          <Text font={{ weight: 'semi-bold', size: 'normal' }} color={Color.PRIMARY_7}>
            {detailToConfigureText}
          </Text>
          <Icon name="share" size={14} flex={{ alignItems: 'center' }} color={Color.PRIMARY_7} />
        </Layout.Horizontal>
      </Link>
    </Layout.Horizontal>
  )
}
