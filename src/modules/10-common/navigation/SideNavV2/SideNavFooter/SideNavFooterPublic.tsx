/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, ButtonVariation, Container, Icon, Layout, Popover } from '@harness/uicore'
import { PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import cx from 'classnames'
import routesV1 from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { SIDE_NAV_STATE, useLayoutV2 } from '@modules/10-common/router/RouteWithLayoutV2'
import { returnUrlParams } from '@common/utils/routeUtils'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import css from './SideNavFooter.module.scss'

const SignInButton: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()

  return (
    <Button
      width={'100%'}
      variation={ButtonVariation.SECONDARY}
      onClick={() => {
        history.push({ pathname: routesV1.toRedirect(), search: returnUrlParams(getLoginPageURL({})) })
      }}
    >
      {getString('signUp.signIn')}
    </Button>
  )
}

const SideNavFooterPublic: React.FC = () => {
  const { sideNavState } = useLayoutV2()
  const history = useHistory()

  const isCollapsed = sideNavState === SIDE_NAV_STATE.COLLAPSED
  return (
    <Layout.Horizontal
      className={cx(css.loginButtonContainer)}
      flex={{ justifyContent: 'center' }}
      padding={{ top: !isCollapsed ? 'large' : undefined }}
      onClick={() => {
        history.push({ pathname: routesV1.toRedirect(), search: returnUrlParams(getLoginPageURL({})) })
      }}
    >
      {isCollapsed ? (
        <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <Container className={css.userProfileContent} padding="medium">
              <SignInButton />
            </Container>
          }
          popoverClassName={css.width100}
          targetClassName={css.width100}
          position={PopoverPosition.RIGHT_BOTTOM}
          usePortal={false}
        >
          <Container
            className={cx(css.profileLink)}
            flex={{ justifyContent: 'flex-start' }}
            margin={{ top: 'medium' }}
            padding={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
          >
            <Icon name="log-in" size={24} className={css.loginIcon} />
          </Container>
        </Popover>
      ) : (
        <SignInButton />
      )}
    </Layout.Horizontal>
  )
}

export default SideNavFooterPublic
