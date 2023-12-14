/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory } from 'react-router-dom'
import cx from 'classnames'

import { Text, Button, ButtonVariation, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import paths from '@common/RouteDefinitions'
import { returnUrlParams } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import css from './PageNotPublic.module.scss'

const PageNotPublic: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  return (
    <div className={css.bg}>
      <Layout.Vertical className={cx(css.content, css.center)} spacing="large">
        <Text color={Color.GREY_1000} font={{ variation: FontVariation.H1 }}>
          {getString('common.publicAccess.oopsPageNotPublic')}
        </Text>
        <Text color={Color.GREY_1000} font={{ variation: FontVariation.H5 }} margin={{ bottom: 'xlarge' }}>
          {getString('common.publicAccess.tryOtherOptions')}
        </Text>
        <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'center' }}>
          <Button
            variation={ButtonVariation.SECONDARY}
            onClick={() => {
              history.push({ pathname: paths.toRedirect(), search: returnUrlParams(getLoginPageURL({})) })
            }}
          >
            {getString('signUp.signIn')}
          </Button>
        </Layout.Horizontal>
      </Layout.Vertical>
    </div>
  )
}

export default PageNotPublic
