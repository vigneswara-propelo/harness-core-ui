import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, ButtonVariation, Layout, Checkbox } from '@harness/uicore'
import { Icon, IconName } from '@harness/icons'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { ModulePathParams, OrgPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getRouteParams } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { Scope } from 'framework/types/types'
import routes from '@common/RouteDefinitionsV2'
import useScopeSwitchDialog from './useScopeSwitchDialog'
import css from './ScopeSwitchDialog.module.scss'

interface SecondaryScopeSwitchProps {
  targetScope: Scope
  targetPathParams?: ProjectPathProps | OrgPathProps
  pageName: string
  onContinue?: () => void
}

interface useSecondaryScopeSwitchDialogReturn {
  showDialog: (props: SecondaryScopeSwitchProps) => void
  closeDialog: () => void
}

const scopeIconMap: Record<Scope, IconName> = {
  [Scope.PROJECT]: 'nav-project',
  [Scope.ORGANIZATION]: 'nav-organization',
  [Scope.ACCOUNT]: 'Account'
}

export const SKIP_SCOPE_SWITCH_DIALOG_KEY = 'skipSecondaryScopeSwitchDialog'

const useSecondaryScopeSwitchDialog = (): useSecondaryScopeSwitchDialogReturn => {
  const { getString } = useStrings()
  const history = useHistory()
  const { setPreference: setSkipSecondaryScopeSwitchDialog, preference: skipSecondayScopeSwitchDialog } =
    usePreferenceStore<boolean>(PreferenceScope.USER, SKIP_SCOPE_SWITCH_DIALOG_KEY)
  const { showDialog: showScopeSwitchDialog, hideDialog: hideScopeSwitchDialog } = useScopeSwitchDialog()
  const { module } = getRouteParams<ModulePathParams>()

  return {
    showDialog: (props: SecondaryScopeSwitchProps) => {
      const { onContinue, targetScope, targetPathParams, pageName } = props

      if (!skipSecondayScopeSwitchDialog) {
        showScopeSwitchDialog({
          targetScope,
          title: getString('common.scopeSwitchDialog.secondary.title', {
            targetScope
          }),
          subtitle: getString('common.scopeSwitchDialog.secondary.subtitle', { pageName, targetScope }),
          content: (
            <>
              <Button
                variation={ButtonVariation.PRIMARY}
                margin={{ right: 'small' }}
                onClick={() => {
                  hideScopeSwitchDialog()
                  if (onContinue) {
                    onContinue()
                  } else {
                    history.push(routes.replace({ ...targetPathParams, module }))
                  }
                }}
              >
                {getString('continue')}
              </Button>
              <Button
                variation={ButtonVariation.SECONDARY}
                onClick={() => {
                  hideScopeSwitchDialog()
                }}
              >
                {getString('cancel')}
              </Button>
            </>
          ),
          rightContent: (
            <>
              <Layout.Vertical className={css.scopeIconContainer}>
                <Icon className={css.icon} name={scopeIconMap[targetScope]} size={160} margin={{ bottom: 'xxsmall' }} />
                <Checkbox
                  label="Do not show again"
                  checked={skipSecondayScopeSwitchDialog}
                  onChange={() => {
                    setSkipSecondaryScopeSwitchDialog(!skipSecondayScopeSwitchDialog)
                  }}
                />
              </Layout.Vertical>
            </>
          )
        })
      } else {
        if (onContinue) {
          onContinue()
        } else {
          history.push(routes.replace({ ...targetPathParams, module }))
        }
      }
    },
    closeDialog: () => {
      hideScopeSwitchDialog()
    }
  }
}

export default useSecondaryScopeSwitchDialog
