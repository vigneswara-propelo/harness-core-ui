/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Icon, IconName, IconProps, Layout, Text } from '@harness/uicore'
import { Position, Popover } from '@blueprintjs/core'
import { NavLink, NavLinkProps } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { StringKeys, useStrings } from 'framework/strings'
import { NavModuleName, useNavModuleInfoMap } from '@common/hooks/useNavModuleInfo'
import { ModuleName } from 'framework/types/ModuleName'
import { useTelemetry } from '@modules/10-common/hooks/useTelemetry'
import { NavActions } from '@modules/10-common/constants/TrackingConstants'
import { getRouteParams } from '@modules/10-common/utils/routeUtils'
import { ModePathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import css from './ModeSelector.module.scss'

interface ModeInfoPopoverProps {
  modeLabel: StringKeys
  icon?: IconName
  modeContent: string
  learnMoreOnClick?: () => void
  hideLearnMore?: boolean
}

interface ModeCardProps extends NavLinkProps {
  shortLabel: StringKeys
  icon: IconName
  modeBorderCss: string
  isSelected?: boolean
  iconprops?: Partial<IconProps>
  leftIcon?: boolean
  popoverProps: ModeInfoPopoverProps
  learnMoreOnClick?: () => void
  hideLearnMore?: boolean
  showNewTag?: boolean
}

const navModeToClassMap: Record<NavModuleName, string> = {
  [ModuleName.CD]: css.cd,
  [ModuleName.CI]: css.ci,
  [ModuleName.CV]: css.srm,
  [ModuleName.CF]: css.ff,
  [ModuleName.CE]: css.ccm,
  [ModuleName.STO]: css.sto,
  [ModuleName.CHAOS]: css.chaos,
  [ModuleName.IACM]: css.iacm,
  [ModuleName.SSCA]: css.ssca,
  [ModuleName.IDP]: css.idp,
  [ModuleName.CODE]: css.default,
  [ModuleName.CET]: css.cet,
  [ModuleName.SEI]: css.sei
}

const ModeInfoPopover = ({
  modeLabel,
  modeContent,
  icon,
  learnMoreOnClick,
  hideLearnMore = false
}: ModeInfoPopoverProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="xsmall" className={css.tooltipDetail}>
      <Layout.Vertical spacing="xsmall">
        <Text
          color={Color.GREY_100}
          font={{ variation: FontVariation.SMALL_BOLD }}
          lineClamp={2}
          style={{ wordBreak: 'break-word' }}
        >
          {getString(modeLabel)}
        </Text>
        <Text className={css.tooltipModeInfoContent}>{modeContent}</Text>
      </Layout.Vertical>
      <Layout.Horizontal className={css.learnMore}>
        {!hideLearnMore ? (
          <Text
            color={Color.PRIMARY_5}
            icon="code-info"
            iconProps={{ color: Color.PRIMARY_5 }}
            onClick={learnMoreOnClick}
            font={{ variation: FontVariation.SMALL_SEMI }}
            className={css.clickable}
          >
            {getString('learnMore')}
          </Text>
        ) : null}
        {icon ? <Icon name={icon} size={64} className={css.tooltipModeIcon} /> : null}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export function ModeCard(props: ModeCardProps): JSX.Element {
  const {
    icon,
    shortLabel,
    iconprops,
    leftIcon,
    isSelected,
    popoverProps,
    onClick,
    modeBorderCss,
    showNewTag,
    ...rest
  } = props
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { mode } = getRouteParams<ModePathProps>()

  return (
    <Popover
      position={Position.RIGHT}
      popoverClassName={css.tooltipPopoverStyle}
      interactionKind="hover"
      hoverOpenDelay={1500}
      hoverCloseDelay={100}
      content={
        <ModeInfoPopover
          icon={popoverProps.icon || icon}
          modeContent={popoverProps.modeContent}
          modeLabel={popoverProps.modeLabel}
          learnMoreOnClick={rest.learnMoreOnClick}
          hideLearnMore={rest.hideLearnMore}
        />
      }
    >
      <NavLink
        className={cx(css.modeCard, modeBorderCss)}
        activeClassName={css.active}
        onClick={e => {
          onClick?.(e)
          trackEvent(NavActions.ModeChange, { currentMode: mode, newMode: shortLabel })
        }}
        {...rest}
      >
        {leftIcon ? (
          <Icon name={icon} {...iconprops} className={cx(css.marginRight12, { [css.active]: isSelected })} />
        ) : null}
        <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={2} style={{ wordBreak: 'break-word' }}>
          {getString(popoverProps.modeLabel)}
        </Text>
        {leftIcon ? null : (
          <Icon name={icon} size={32} {...iconprops} className={cx(css.modeIcon, { [css.active]: isSelected })} />
        )}
        {showNewTag && (
          <Text
            font={{ variation: FontVariation.TINY_SEMI }}
            padding="xxsmall"
            color={Color.PURPLE_800}
            background={Color.PURPLE_50}
            className={css.newTag}
          >
            {getString('common.new').toUpperCase()}
          </Text>
        )}
      </NavLink>
    </Popover>
  )
}

interface ModuleCardProps extends NavLinkProps {
  moduleName: NavModuleName
  onModuleClick: (module: NavModuleName) => void
  learnMoreOnClick?: () => void
  showNewTag?: boolean
}

export function ModuleCard({ moduleName, onModuleClick, ...rest }: ModuleCardProps): JSX.Element {
  const moduleMap = useNavModuleInfoMap()
  const { getString } = useStrings()
  const { shortLabel, icon, label, moduleIntro } = moduleMap[moduleName]
  const modeContent = moduleIntro ? getString(moduleIntro) : ''

  return (
    <ModeCard
      icon={icon}
      shortLabel={shortLabel}
      modeBorderCss={navModeToClassMap[moduleName]}
      popoverProps={{ modeContent, modeLabel: label }}
      onClick={() => {
        onModuleClick(moduleName)
      }}
      {...rest}
    />
  )
}
