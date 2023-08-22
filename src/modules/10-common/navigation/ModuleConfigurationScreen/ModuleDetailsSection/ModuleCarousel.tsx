/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import Lottie from 'react-lottie-player'
import { Icon } from '@harness/icons'
import { Container, Layout, Text, Carousel } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import useNavModuleInfo, { NavModuleName } from '@common/hooks/useNavModuleInfo'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { MassagedModuleData, ModuleContentType } from '../useGetContentfulModules'
import CarouselImageAndDescription from '../CarousellmageAndDescription/CarousellmageAndDescription'
import LottieRenderer from '../LottieRenderer/LottieRenderer'
import css from './ModuleCarousel.module.scss'

export interface ModuleCarouselProps {
  module: NavModuleName
  data?: MassagedModuleData
}

const getComponentBasedOnType = (type: ModuleContentType): React.ComponentType<any> => {
  const componentMap: Record<ModuleContentType, React.ComponentType<any>> = {
    [ModuleContentType.CENTER_ALIGNED_IMAGE_DESC]: CarouselImageAndDescription,
    [ModuleContentType.LOTTIE]: LottieRenderer
  }
  return componentMap[type]
}

const ModuleCarousel: React.FC<ModuleCarouselProps> = ({ module: selectedModule, data: massagedModuleData }) => {
  const { icon, label: leftNavLabel } = useNavModuleInfo(selectedModule)
  const [defaultLottie, setDefaultLottie] = useState<object | undefined>()
  const { getString } = useStrings()
  const { label, data = [] } = massagedModuleData || {}
  const { CDS_NAV_2_0: isLightThemed } = useFeatureFlags()
  useEffect(() => {
    if (isLightThemed) {
      import('./nav_lottie.json').then(json => {
        setDefaultLottie(json)
      })
    } else {
      import('./default_lottie.json').then(json => {
        setDefaultLottie(json)
      })
    }
  }, [])

  return (
    <Container className={cx(css.container, { [css.lightContainer]: isLightThemed })} height="100%">
      <Container className={cx({ [css.lottieLayer]: isLightThemed })}>
        <Layout.Horizontal className={cx(css.heading, { [css.iconHeading]: isLightThemed })}>
          {icon && <Icon name={icon} size={40} margin={{ right: 'xsmall' }} />}
          <Text font={{ variation: FontVariation.H5 }} color={Color.GREY_700}>
            {label}
          </Text>
          {isLightThemed && (
            <Text font={{ variation: FontVariation.H5 }} color={Color.BLACK}>
              {getString(leftNavLabel)}
            </Text>
          )}
        </Layout.Horizontal>
        <Container className={css.main}>
          <Carousel
            className={css.carousel}
            hideSlideChangeButtons
            slideClassName={css.carouselSlide}
            indicatorsClassName={css.indicators}
            activeIndicatorClassName={css.indicatorActive}
            autoPlay
            autoPlayInterval={10000}
            hideIndicators={data.length <= 1}
          >
            {data.length > 0 ? (
              data.map((item, index) => {
                const Component = getComponentBasedOnType(item.type)
                return <Component key={index} {...item.data} activeModule={selectedModule} />
              })
            ) : (
              <Container flex={{ justifyContent: 'center' }} height="100%">
                {defaultLottie && <Lottie animationData={defaultLottie} play />}
              </Container>
            )}
          </Carousel>
        </Container>
      </Container>
    </Container>
  )
}

export default ModuleCarousel
