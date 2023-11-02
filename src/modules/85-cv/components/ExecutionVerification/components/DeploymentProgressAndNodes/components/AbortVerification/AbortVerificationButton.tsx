import React from 'react'
import { Button, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import styles from './AbortVerification.module.scss'

interface AbortVerificationButtonProps {
  handleHandleSkip: (status: boolean) => void
  disabled: boolean
}

export function AbortVerificationButton(props: AbortVerificationButtonProps): JSX.Element {
  const { handleHandleSkip, disabled } = props

  const { getString } = useStrings()
  return (
    <Layout.Vertical className={styles.abortPopover}>
      <Button
        minimal
        padding="medium"
        color={Color.BLACK}
        disabled={disabled}
        data-testid="abortVerificationSuccessButton"
        onClick={() => handleHandleSkip(true)}
        flex={{ justifyContent: 'left' }}
      >
        {getString('cv.abortVerification.markAsSuccess')}
      </Button>
      <Button
        minimal
        padding="medium"
        color={Color.BLACK}
        disabled={disabled}
        data-testid="abortVerificationFailureButton"
        onClick={() => handleHandleSkip(false)}
        flex={{ justifyContent: 'left' }}
      >
        {getString('cv.abortVerification.markAsFailure')}
      </Button>
    </Layout.Vertical>
  )
}
