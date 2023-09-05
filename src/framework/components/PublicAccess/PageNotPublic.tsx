/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'

import { Text, Button, ButtonVariation, Container, HarnessIcons, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import paths from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import css from './PageNotPublic.module.scss'

const PageNotPublic: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const HarnessLogoWhite = HarnessIcons['harness-logo-white']
  return (
    <div className={css.bg}>
      <div className={css.gradient}>
        <Layout.Vertical className={cx(css.content, css.center)} spacing="xxxlarge">
          <Container margin={{ bottom: 'xxxlarge' }}>
            <HarnessLogoWhite height={55} />
          </Container>
          <Layout.Vertical>
            <Text color={Color.WHITE} font={{ variation: FontVariation.H1 }} margin={{ bottom: 'xlarge' }}>
              {getString('common.publicAccess.oopsPageNotPublic')}
            </Text>
            <Text color={Color.WHITE} font={{ variation: FontVariation.H5 }} margin={{ bottom: 'xlarge' }}>
              {getString('common.publicAccess.tryOtherOptions')}
            </Text>
            <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'center' }}>
              <Button
                variation={ButtonVariation.SECONDARY}
                className={css.buttonModification}
                onClick={() => {
                  history.push({ pathname: paths.toRedirect(), search: returnUrlParams(getLoginPageURL({})) })
                }}
              >
                {getString('signUp.signIn')}
              </Button>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Vertical>
      </div>
    </div>
  )
}

export default PageNotPublic
