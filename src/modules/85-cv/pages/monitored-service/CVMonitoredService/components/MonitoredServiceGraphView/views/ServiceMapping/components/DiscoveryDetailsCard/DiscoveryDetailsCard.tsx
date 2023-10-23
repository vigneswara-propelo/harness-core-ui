/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Icon, Card, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { AutoDiscoveryResponseDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './DiscoveryDetailsCard.module.scss'

const DiscoveryDetailsCard = ({
  data,
  onClose
}: {
  data: AutoDiscoveryResponseDTO
  onClose: () => void
}): JSX.Element => {
  const { getString } = useStrings()
  const { monitoredServicesCreated, serviceDependenciesImported } = data
  const label = monitoredServicesCreated?.length
    ? getString('cv.monitoredServices.importServiceMapping.msImport')
    : getString('cv.monitoredServices.importServiceMapping.noMSImport')
  return (
    <Card className={css.detailCard} data-testid="discoveryDetailCard">
      <Layout.Horizontal spacing="large">
        <Text font={{ variation: FontVariation.FORM_LABEL }}>{label}</Text>
        <Icon data-testid="closeDiscoveryDetailCard" className={css.closeIcon} name="cross" onClick={onClose} />
      </Layout.Horizontal>
      <ul className={css.list}>
        {monitoredServicesCreated?.map(item => (
          <li color={Color.BLACK} key={item}>
            {item}
          </li>
        ))}
      </ul>
      <Text font={{ variation: FontVariation.FORM_LABEL }}>
        {getString('cv.monitoredServices.importServiceMapping.serviceDependenciesImported', {
          count: serviceDependenciesImported
        })}
      </Text>
    </Card>
  )
}

export default DiscoveryDetailsCard
