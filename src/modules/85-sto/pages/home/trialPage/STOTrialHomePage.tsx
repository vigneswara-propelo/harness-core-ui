/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Heading, Layout, Container, Text, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import bgImageURL from '../sto.svg'
import css from './STOTrialPage.module.scss'

const SALES_URL =
  'https://www.harness.io/company/contact-sales?utm_source=Website&utm_medium=internal&utm_content=Contact-Sales-STO-Pricing'
const SEI_HOME = 'https://www.harness.io/products/software-engineering-insights'

const STOTrialHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container className={css.body} style={{ background: `transparent url(${bgImageURL}) no-repeat` }}>
      <Heading className={css.heading} font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
        {getString('common.stoText')}
      </Heading>
      <Layout.Vertical spacing="small">
        <Text padding={{ bottom: 'xxlarge' }} width={500}>
          {getString('sto.trial.description')}
        </Text>
        <a href={SEI_HOME} rel="noreferrer" target="_blank">
          {getString('sto.trial.learnMore')}
        </a>
        <Button
          style={{ cursor: 'default' }}
          width={300}
          height={45}
          text={getString('sto.trial.comingSoon')}
          disabled
        />
        <Button
          width={300}
          height={45}
          intent="primary"
          target="_blank"
          href={SALES_URL}
          text={getString('common.banners.trial.contactSales')}
        />
      </Layout.Vertical>
    </Container>
  )
}

export default STOTrialHomePage
