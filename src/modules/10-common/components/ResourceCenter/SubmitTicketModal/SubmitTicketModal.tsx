/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepWizard, ModalDialog } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, SupportTicketActions } from '@common/constants/TrackingConstants'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { SubmitTicketModalStepOne } from './SubmitTicketModalSteps/SubmitTicketModalStepOne'
import { SubmitTicketModalStepTwo } from './SubmitTicketModalSteps/SubmitTicketModalStepTwo'
import { AIDASupportStep } from './SubmitTicketModalSteps/AIDASupportStep'
import { useCoveoControllers } from './Controllers/useCoveoControllers'
import css from './SubmitTicketModal.module.scss'

interface SubmitTicketModalProps {
  isOpen: boolean
  close(): void
}

export const SubmitTicketModal = ({ isOpen, close }: SubmitTicketModalProps): JSX.Element => {
  const { resultList, searchBox } = useCoveoControllers()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { CDS_AIDA_SUPPORT_DEFLECTION } = useFeatureFlags()

  React.useEffect(() => {
    trackEvent(SupportTicketActions.SubmitTicketModalOpen, {
      category: Category.SUPPORT_TICKET_DEFLECTION
    })
  }, [])

  return (
    <ModalDialog
      isOpen={isOpen}
      enforceFocus={false}
      onClose={close}
      className={css.submitTicketWizard}
      width={1200}
      showOverlay={false}
    >
      <StepWizard
        initialStep={1}
        icon="pipeline-deploy"
        iconProps={{ size: 37, className: css.icon }}
        title={getString('common.resourceCenter.ticketmenu.submitTicket')}
      >
        {CDS_AIDA_SUPPORT_DEFLECTION ? (
          <AIDASupportStep name="Ticket Subject" stepName="Ticket Subject" />
        ) : (
          <SubmitTicketModalStepOne
            name="Ticket Subject"
            stepName="Ticket Subject"
            searchBoxController={searchBox}
            resultListController={resultList}
          />
        )}
        <SubmitTicketModalStepTwo name="Ticket Details" stepName="Ticket Details" onCloseHandler={close} />
      </StepWizard>
    </ModalDialog>
  )
}
