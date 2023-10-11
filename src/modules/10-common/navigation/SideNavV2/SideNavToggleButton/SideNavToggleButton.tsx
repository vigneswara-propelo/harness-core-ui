import React from 'react'
import cx from 'classnames'
import { Container, Icon, Popover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { SIDE_NAV_STATE, useLayoutV2 } from '@modules/10-common/router/RouteWithLayoutV2'
import css from './SideNavToggleButton.module.scss'

const SideNavToggleButton: React.FC = () => {
  const { sideNavState, setSideNavState } = useLayoutV2()
  const { getString } = useStrings()

  const isExpanded = sideNavState === SIDE_NAV_STATE.EXPANDED
  return (
    <Container
      className={cx(css.container, {
        [css.collapse]: isExpanded,
        [css.expand]: !isExpanded
      })}
      onClick={() => {
        if (sideNavState === SIDE_NAV_STATE.EXPANDED) {
          setSideNavState(SIDE_NAV_STATE.COLLAPSED, true)
        } else {
          setSideNavState(SIDE_NAV_STATE.EXPANDED, true)
        }
      }}
      onMouseEnter={/* istanbul ignore next */ e => e.stopPropagation()}
      onMouseLeave={/* istanbul ignore next */ e => e.stopPropagation()}
    >
      <Popover
        content={
          <Text color={Color.WHITE} padding="small">
            {isExpanded ? getString('common.collapse') : getString('common.expand')}
          </Text>
        }
        portalClassName={css.popover}
        popoverClassName={Classes.DARK}
        interactionKind={PopoverInteractionKind.HOVER}
        position={Position.LEFT}
      >
        <Icon className={css.triangle} name="symbol-triangle-up" size={12} />
      </Popover>
    </Container>
  )
}

export default SideNavToggleButton
