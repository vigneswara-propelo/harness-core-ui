import React from 'react'
import { useHistory } from 'react-router-dom'
import { Button, ButtonVariation } from '@harness/uicore'
import { ModulePathParams, OrgPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getRouteParams } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { Scope } from 'framework/types/types'
import routes from '@common/RouteDefinitionsV2'
import useScopeSwitchDialog from './useScopeSwitchDialog'

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

const useSecondaryScopeSwitchDialog = (): useSecondaryScopeSwitchDialogReturn => {
  const { getString } = useStrings()
  const history = useHistory()
  const { showDialog: showScopeSwitchDialog, hideDialog: hideScopeSwitchDialog } = useScopeSwitchDialog()
  const { module } = getRouteParams<ModulePathParams>()

  return {
    showDialog: (props: SecondaryScopeSwitchProps) => {
      const { onContinue, targetScope, targetPathParams, pageName } = props

      showScopeSwitchDialog({
        targetScope,
        title: `We are switching you to the ${targetScope} scope`,
        subtitle: `You have selected to view ${pageName} so we will switch your scope to the ${targetScope} level to view more details.`,
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
        )
      })
    },
    closeDialog: () => {
      hideScopeSwitchDialog()
    }
  }
}

export default useSecondaryScopeSwitchDialog
