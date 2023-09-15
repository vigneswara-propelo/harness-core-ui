import React from 'react'
import { Dialog, IconName, Layout, Text, Container } from '@harness/uicore'
import { Icon } from '@harness/icons'
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
}

// interface ScopeSwitchDialoActions {
//   clickOnSelectScope: () => void
//   onClose: () => void
//   closeScopeSelector: () => void
// }
// interface ScopeSwitchCardProps {
//   icon: IconName
//   onClick: () => void
//   title: string
//   subtitle?: string
// }

// const ScopeSwitchCard: React.FC<ScopeSwitchCardProps> = props => {
//   const { icon, onClick, title, subtitle } = props
//   return (
//     <Card className={css.card} onClick={onClick}>
//       <Icon name={icon} size={32} color={Color.PRIMARY_5} />
//       <Layout.Vertical className={css.flex1} margin={{ left: 'medium' }}>
//         <Text color={Color.GREY_700} font={{ variation: FontVariation.H6 }} margin={{ bottom: 'xsmall' }}>
//           {title}
//         </Text>
//         <Text color={Color.GREY_800} font={{ variation: FontVariation.TINY_SEMI }} lineClamp={2}>
//           {subtitle}
//         </Text>
//       </Layout.Vertical>
//     </Card>
//   )
// }

const scopeIconMap: Record<Scope, IconName> = {
  [Scope.PROJECT]: 'nav-project',
  [Scope.ORGANIZATION]: 'nav-organization',
  [Scope.ACCOUNT]: 'Account'
}

const ScopeSwitchDialog: React.FC<ScopeSwitchDialogProps> = props => {
  const { title, subtitle, content, targetScope, onClose, hideScopeIcon } = props

  return (
    <Dialog isOpen enforceFocus={false} className={css.dialog} onClose={onClose}>
      <Layout.Horizontal>
        <Layout.Vertical className={css.flex1}>
          <Text font={{ variation: FontVariation.H4 }} margin={{ bottom: 'small' }}>
            {title}
          </Text>
          {subtitle ? <Text font={{ variation: FontVariation.BODY }}>{subtitle}</Text> : undefined}
          <Layout.Horizontal padding={{ top: 'xxlarge' }}>{content}</Layout.Horizontal>
        </Layout.Vertical>
        {!hideScopeIcon && (
          <Container className={css.scopeIconContainer}>
            <Icon name={scopeIconMap[targetScope]} size={180} />
          </Container>
        )}
      </Layout.Horizontal>
    </Dialog>
  )
}

export default ScopeSwitchDialog
