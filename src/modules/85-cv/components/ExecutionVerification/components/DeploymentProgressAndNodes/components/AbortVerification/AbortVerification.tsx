import React, { useEffect, useState } from 'react'
import { Dialog, ButtonVariation, Layout, Popover, Button, Container, Text, useToaster } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useModalHook } from '@harness/use-modal'
import { useStrings } from 'framework/strings'
import { useAbortVerifyStep } from 'services/cv'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  AbortVerificationDialogProps,
  failRequestText,
  failText,
  successRequestText,
  successText
} from './AbortVerification.constants'

import { AbortVerificationButton } from './AbortVerificationButton'

interface AbortVerificationProps {
  activityId?: string
}

const AbortVerification = (props: AbortVerificationProps): JSX.Element => {
  const { activityId: verifyStepExecutionId } = props

  const { getString } = useStrings()
  const { showError } = useToaster()

  const [skipType, setSkipType] = useState<boolean | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { mutate } = useAbortVerifyStep({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    verifyStepExecutionId: verifyStepExecutionId as string
  })

  const [openServiceDepedencyModal, hideServiceDepedencyModal] = useModalHook(
    () => (
      <Dialog
        {...AbortVerificationDialogProps}
        enforceFocus={false}
        onClose={() => {
          setSkipType(null)
          hideServiceDepedencyModal()
        }}
        title={getString('cv.abortVerification.buttonText')}
      >
        <Layout.Vertical height="100%" flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text font={{ variation: FontVariation.BODY2 }}>
            {getString('cv.abortVerification.confirmationModalText', {
              type: skipType ? successText : failText
            })}
          </Text>
          <Container>
            <Button
              text={getString('yes')}
              variation={ButtonVariation.PRIMARY}
              data-testid="abortVerificationConfirmButton"
              onClick={handleUpdateVerificationStatus}
              margin={{ right: 'small' }}
            />
            <Button
              text={getString('no')}
              variation={ButtonVariation.SECONDARY}
              onClick={() => {
                setSkipType(null)
                hideServiceDepedencyModal()
              }}
            />
          </Container>
        </Layout.Vertical>
      </Dialog>
    ),
    [skipType]
  )

  useEffect(() => {
    if (skipType !== null) {
      openServiceDepedencyModal()
    }
  }, [openServiceDepedencyModal, skipType])

  async function handleUpdateVerificationStatus(): Promise<void> {
    try {
      await mutate({
        verificationStatus: skipType ? successRequestText : failRequestText
      })
      setIsProcessing(true)
      hideServiceDepedencyModal()
    } catch (error) {
      const message = getErrorMessage(error)
      showError(message)
    }
  }

  function handleHandleSkip(markSuccess: boolean): void {
    setSkipType(markSuccess)
  }

  // 🚨 Add RBAC permission details once it is ready
  const canAbort = true
  // const [canAbort] = usePermission(
  //   {
  //     resource: {
  //       resourceType: ResourceType.MONITOREDSERVICE,
  //       resourceIdentifier: projectIdentifier
  //     },
  //     permissions: [PermissionIdentifier.TOGGLE_MONITORED_SERVICE]
  //   },
  //   [projectIdentifier]
  // )

  if (isProcessing) {
    return (
      <Text margin={{ bottom: 'medium' }} icon="spinner" iconProps={{ margin: { right: 'small' } }}>
        {getString('cv.abortVerification.abortingVerificationMessage')}
      </Text>
    )
  }

  return (
    <Popover
      position={Position.BOTTOM}
      minimal
      interactionKind={PopoverInteractionKind.CLICK}
      content={<AbortVerificationButton disabled={!canAbort} handleHandleSkip={handleHandleSkip} />}
    >
      <Button
        margin={{ bottom: 'medium' }}
        rightIcon="main-chevron-down"
        iconProps={{ margin: { left: 'small' }, size: 12 }}
        data-testid="abortVerificationButton"
        variation={ButtonVariation.TERTIARY}
        disabled={!canAbort}
        // tooltip={!canAbort ? (
        //   <RBACTooltip
        //     permission={PermissionIdentifier.TOGGLE_MONITORED_SERVICE}
        //     resourceType={ResourceType.MONITOREDSERVICE}
        //   />
        // ) : undefined}
      >
        {getString('cv.abortVerification.buttonText')}
      </Button>
    </Popover>
  )
}

export default AbortVerification
