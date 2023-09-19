import React from 'react'
import { Dialog, IconName, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { OrgPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from 'framework/types/types'
import css from './ScopeSwitchDialog.module.scss'

export interface PrimaryButtonProps {
  icon: IconName
  onClick: (params: ProjectPathProps | OrgPathProps | undefined) => void
  title: string
  subtitle?: string
}
export interface ScopeSwitchDialogProps {
  targetScope: Scope
  title: React.ReactNode
  subtitle?: string
  content: React.ReactNode
  onClose?: () => void
  hideScopeIcon?: boolean
  rightContent?: React.ReactNode
}

const ScopeSwitchDialog: React.FC<ScopeSwitchDialogProps> = props => {
  const { title, subtitle, content, onClose, rightContent } = props

  return (
    <Dialog isOpen enforceFocus={false} className={css.dialog} onClose={onClose}>
      <Layout.Horizontal className={css.body}>
        <Layout.Vertical className={css.flex1}>
          <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'small' }}>
            {title}
          </Text>
          {subtitle ? <Text font={{ variation: FontVariation.BODY }}>{subtitle}</Text> : undefined}
          <Layout.Horizontal padding={{ top: 'xxlarge' }}>{content}</Layout.Horizontal>
        </Layout.Vertical>
        {rightContent}
      </Layout.Horizontal>
    </Dialog>
  )
}

export default ScopeSwitchDialog
