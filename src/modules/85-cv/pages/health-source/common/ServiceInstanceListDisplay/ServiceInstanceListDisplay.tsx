import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import style from './ServiceInstanceListDisplay.module.scss'

export interface ServiceInstanceListDisplayProps {
  serviceInstanceList?: string[]
}

const ServiceInstanceListDisplay = (props: ServiceInstanceListDisplayProps): JSX.Element | null => {
  const { serviceInstanceList } = props

  const [serviceInstanceListToDisplay, setServiceInstanceListToDisplay] = useState<string[]>([])
  const [canShowAllServiceInstanceNames, setCanShowAllServiceInstanceNames] = useState<boolean>(false)

  const { SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW } = useFeatureFlags()

  const { getString } = useStrings()

  const canShowExpandListButton = useMemo(
    () => Boolean(Number(serviceInstanceList?.length) > 10),
    [serviceInstanceList]
  )

  const expandButtonText = useMemo(
    () => (canShowAllServiceInstanceNames ? getString('common.showLess') : getString('common.showMore')),
    [canShowAllServiceInstanceNames, getString]
  )

  useEffect(() => {
    if (Array.isArray(serviceInstanceList) && serviceInstanceList.length) {
      setServiceInstanceListToDisplay(serviceInstanceList.slice(0, 10))
    }
  }, [serviceInstanceList])

  const handleServiceInstanceShowMoreClick = useCallback(() => {
    if (canShowAllServiceInstanceNames) {
      setServiceInstanceListToDisplay((serviceInstanceList as string[]).slice(0, 10))
    } else {
      setServiceInstanceListToDisplay(serviceInstanceList as string[])
    }

    setCanShowAllServiceInstanceNames(canShow => !canShow)
  }, [canShowAllServiceInstanceNames, serviceInstanceList])

  if (
    !SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW ||
    !Array.isArray(serviceInstanceList) ||
    !serviceInstanceList.length
  ) {
    return null
  }

  return (
    <Container>
      <Text font={{ variation: FontVariation.CARD_TITLE }} margin={{ bottom: 'small' }}>
        {getString('cv.monitoringSources.serviceInstanceHostNamesTitle')}
      </Text>

      <Layout.Horizontal className={style.serviceInstanceNameHolder} data-testid="serviceInstanceListDisplay">
        {serviceInstanceListToDisplay.map(serviceInstanceName => (
          <Text
            margin={{ right: 'none' }}
            font={{ variation: FontVariation.BODY2 }}
            className={style.serviceInstanceName}
            key={serviceInstanceName}
          >
            {serviceInstanceName}
          </Text>
        ))}

        {canShowExpandListButton && (
          <Button
            variation={ButtonVariation.LINK}
            onClick={handleServiceInstanceShowMoreClick}
            data-testid="serviceInstanceNamesShowMoreButton"
          >
            {expandButtonText}
          </Button>
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export default ServiceInstanceListDisplay
