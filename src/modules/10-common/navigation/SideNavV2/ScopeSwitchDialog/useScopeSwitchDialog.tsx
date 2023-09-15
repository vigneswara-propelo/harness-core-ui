import React, { useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import ScopeSwitchDialog, { ScopeSwitchDialogProps } from './ScopeSwitchDialog'

interface useScopeSwitchDialogReturn {
  showDialog: (props: ScopeSwitchDialogProps) => void
  hideDialog: () => void
}

const useScopeSwitchDialog = (): useScopeSwitchDialogReturn => {
  const [scopeSwitchProps, setScopeSwitchProps] = useState<ScopeSwitchDialogProps | undefined>()

  const [openDialog, closeDialog] = useModalHook(() => {
    if (scopeSwitchProps) {
      return (
        <ScopeSwitchDialog
          {...scopeSwitchProps}
          onClose={() => {
            setScopeSwitchProps(undefined)
            closeDialog?.()
          }}
        />
      )
    }

    return null
  }, [scopeSwitchProps])

  return {
    showDialog: props => {
      setScopeSwitchProps(props)
      openDialog()
    },
    hideDialog: () => {
      setScopeSwitchProps(undefined)
      closeDialog?.()
    }
  }
}

export default useScopeSwitchDialog
