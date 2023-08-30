import { Container, Layout, Text, useToggleOpen } from '@harness/uicore'
import cx from 'classnames'
import React, { useState } from 'react'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { AidaActions } from '@common/constants/TrackingConstants'
import { String } from 'framework/strings'
import { SubmitTicketModal } from '../ResourceCenter/SubmitTicketModal/SubmitTicketModal'
import css from './UsefulOrNot.module.scss'

export enum AidaClient {
  CS_BOT = 'CS_BOT'
}

interface TelemeteryProps {
  aidaClient: AidaClient
  metadata?: Record<string, string | boolean | number>
}

interface UsefulOrNotProps {
  telemetry: TelemeteryProps
  allowCreateTicket?: boolean
  onVote?: (vote: Vote) => void
}

enum Vote {
  None,
  Up,
  Down
}

function UsefulOrNot({ telemetry, onVote, allowCreateTicket }: UsefulOrNotProps): JSX.Element {
  const { trackEvent } = useTelemetry()
  const [voted, setVoted] = useState<Vote>(Vote.None)
  const { isOpen, close: closeSubmitTicketModal, open: openSubmitTicketModal } = useToggleOpen()

  return (
    <Container className={css.usefulOrNot}>
      <Layout.Horizontal flex={{ align: 'center-center' }}>
        <Text>
          <String stringID="common.isHelpful" />
        </Text>
        <button
          disabled={voted !== Vote.None}
          className={cx({ [css.votedUp]: voted === Vote.Up }, css.voteButton)}
          onClick={() => {
            trackEvent(AidaActions.VoteReceived, { helpful: 'yes', ...telemetry })
            setVoted(Vote.Up)
            onVote?.(Vote.Up)
          }}
        >
          <String stringID="yes" />
        </button>
        <button
          disabled={voted !== Vote.None}
          className={cx({ [css.votedDown]: voted === Vote.Down }, css.voteButton)}
          onClick={() => {
            trackEvent(AidaActions.VoteReceived, { helpful: 'no', ...telemetry })
            setVoted(Vote.Down)
            onVote?.(Vote.Down)
          }}
        >
          <String stringID="no" />
        </button>
      </Layout.Horizontal>
      {allowCreateTicket && voted === Vote.Down ? (
        <Layout.Horizontal spacing="small" flex={{ align: 'center-center' }}>
          <SubmitTicketModal isOpen={isOpen} close={closeSubmitTicketModal} />
          <String stringID="common.csBot.ticketOnError" />
          <a href="#" onClick={openSubmitTicketModal}>
            <String stringID="common.clickHere" />
          </a>
        </Layout.Horizontal>
      ) : null}
    </Container>
  )
}

export default UsefulOrNot
