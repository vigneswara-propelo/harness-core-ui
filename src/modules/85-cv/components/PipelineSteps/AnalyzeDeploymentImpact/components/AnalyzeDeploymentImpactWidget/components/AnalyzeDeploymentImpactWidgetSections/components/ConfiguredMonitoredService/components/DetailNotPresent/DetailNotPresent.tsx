import { Layout, Text, Icon } from '@harness/uicore'
import React from 'react'

interface DetailsNotPresentProps {
  detailNotPresentMessage: string
}

export default function DetailNotPresent(props: DetailsNotPresentProps): JSX.Element {
  const { detailNotPresentMessage } = props
  return (
    <Layout.Horizontal padding={{ top: 'small' }}>
      <Icon name="info-messaging" size={16} flex={{ alignItems: 'flex-start' }} padding={{ right: 'small' }} />
      <Text>{detailNotPresentMessage}</Text>
    </Layout.Horizontal>
  )
}
