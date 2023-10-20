import React from 'react'
import { Heading, Layout, Container, Text, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { SALES_URL } from '@modules/75-sei/constants'
import { useStrings } from 'framework/strings'
import seiTrialImage from './images/seiTrial.svg'
import css from './SEITrialPage.module.scss'

const SEITrialPage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.body} style={{ background: `transparent url(${seiTrialImage}) no-repeat` }}>
      <Heading className={css.heading} font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
        {getString('common.purpose.sei.fullName')}
      </Heading>
      <Layout.Vertical spacing="small">
        <Text padding={{ bottom: 'xxlarge' }} width={500}>
          {getString('common.purpose.sei.descriptionOnly')}
        </Text>
        <a href="https://www.harness.io/products/software-engineering-insights" rel="noreferrer" target="_blank">
          {getString('learnMore')}
        </a>
        <Button width={300} height={45} intent="primary" target="_blank" href={SALES_URL} text={'Contact Sales'} />
      </Layout.Vertical>
    </Container>
  )
}
export default SEITrialPage
