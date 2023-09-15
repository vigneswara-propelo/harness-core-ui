import React from 'react'
import { Card, Icon, Layout, Text } from '@harness/uicore'
import { useHistory } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import { IconName } from '@harness/icons'
import { Scope } from 'framework/types/types'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitionsV2'
import { NAV_MODE, getRouteParams } from '@common/utils/routeUtils'
import { ModePathProps, ModulePathParams, OrgPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import useScopeSwitchDialog from './useScopeSwitchDialog'
import css from './ScopeSwitchDialog.module.scss'

export interface ScopeLinkParams {
  icon: IconName
  label: string
  info: string
  onClick: (targetScopeParams?: ProjectPathProps | OrgPathProps) => void
}

interface PrimaryScopeSwitchProps {
  targetScope: Scope
  targetScopeParams?: ProjectPathProps | OrgPathProps
  pageName?: string
  link?: ScopeLinkParams
  handleSelectScopeClick: () => void
}

interface usePrimaryScopeSwitchDialogReturn {
  showDialog: (props: PrimaryScopeSwitchProps) => void
  closeDialog: () => void
}

interface ScopeSwitchCardProps {
  icon: IconName
  onClick: () => void
  title: string
  subtitle?: string
}

const ScopeSwitchCard: React.FC<ScopeSwitchCardProps> = props => {
  const { icon, onClick, title, subtitle } = props
  return (
    <Card className={css.card} onClick={onClick}>
      <Icon name={icon} size={32} color={Color.PRIMARY_5} />
      <Layout.Vertical className={css.flex1} margin={{ left: 'medium' }}>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.H6 }} margin={{ bottom: 'xsmall' }}>
          {title}
        </Text>
        <Text color={Color.GREY_800} font={{ variation: FontVariation.TINY_SEMI }} lineClamp={2}>
          {subtitle}
        </Text>
      </Layout.Vertical>
    </Card>
  )
}

interface usePrimaryScopeSwitchDialogProps {
  closeScopeSelector: () => void
}

const usePrimaryScopeSwitchDialog = ({
  closeScopeSelector
}: usePrimaryScopeSwitchDialogProps): usePrimaryScopeSwitchDialogReturn => {
  const { showDialog: showScopeSwitchDialog, hideDialog: hideScopeSwitchDialog } = useScopeSwitchDialog()
  const { module, mode } = getRouteParams<ModulePathParams & ModePathProps>()
  const history = useHistory()
  const { getString } = useStrings()

  return {
    showDialog: (props: PrimaryScopeSwitchProps) => {
      const { targetScope, pageName, link, targetScopeParams, handleSelectScopeClick } = props

      showScopeSwitchDialog({
        targetScope,
        title: (
          <>
            {getString('common.dataUnavailableInScope', {
              pageName: pageName || 'Current page',
              scope: targetScope
            })}
            <br />
            {getString('common.doInstead')}
          </>
        ),
        content: (
          <>
            {link ? (
              <ScopeSwitchCard
                title={link.label}
                subtitle={link.info}
                icon={link.icon}
                onClick={() => {
                  closeScopeSelector()
                  hideScopeSwitchDialog()
                  link?.onClick(targetScopeParams)
                }}
              />
            ) : (
              <ScopeSwitchCard
                title={getString('common.viewSettings', { scope: targetScope })}
                subtitle={getString('common.viewAndManageSettings', { scope: targetScope })}
                icon="nav-settings"
                onClick={() => {
                  hideScopeSwitchDialog()
                  closeScopeSelector()

                  // redirect to settings page of all module if mode is all since we don't have module settings page in all modules
                  history.push(
                    routes.toSettings({ ...targetScopeParams, module: mode !== NAV_MODE.ALL ? module : undefined })
                  )
                }}
              />
            )}
            <ScopeSwitchCard
              title={getString('common.selectAnotherScope')}
              subtitle={getString('common.selectScopeSubtitle')}
              icon="select-scope"
              onClick={() => {
                handleSelectScopeClick()
                hideScopeSwitchDialog()
              }}
            />
          </>
        ),
        onClose: () => {
          hideScopeSwitchDialog()
        },
        hideScopeIcon: true
      })
    },
    closeDialog: () => {
      hideScopeSwitchDialog()
    }
  }
}

export default usePrimaryScopeSwitchDialog
