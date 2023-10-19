/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import cx from 'classnames'
import { Container, Text } from '@harness/uicore'
import React, { useState } from 'react'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { AidaActions } from '@common/constants/TrackingConstants'
import { String } from 'framework/strings'
import AidaFeedback from '../AidaFeedback/AidaFeedback'
import css from './UsefulOrNot.module.scss'

export enum AidaClient {
  CS_BOT = 'CS_BOT',
  CD_RCA = 'CD_RCA',
  CI_RCA = 'CI_RCA',
  STO_REM = 'STO_REM'
}

export interface TelemeteryProps {
  aidaClient: AidaClient
  metadata?: Record<string, string | boolean | number>
}

export interface UsefulOrNotProps {
  telemetry: TelemeteryProps
  allowFeedback?: boolean
  allowCreateTicket?: boolean
  onVote?: (vote: Vote) => void
  className?: string
}

enum Vote {
  None,
  Up,
  Down
}

function UsefulOrNot({
  telemetry,
  onVote,
  allowFeedback = true,
  allowCreateTicket,
  className
}: UsefulOrNotProps): JSX.Element {
  const { trackEvent } = useTelemetry()
  const [voted, setVoted] = useState<Vote>(Vote.None)
  const [showFeedback, setShowFeedback] = useState(false)

  return (
    <Container className={cx(css.usefulOrNot, className)}>
      <div>
        <Text margin={{ right: 'xsmall' }} inline>
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
            setShowFeedback(true)
            onVote?.(Vote.Down)
          }}
        >
          <String stringID="no" />
        </button>
      </div>
      {allowFeedback && showFeedback ? (
        <AidaFeedback allowCreateTicket={allowCreateTicket} setShowFeedback={setShowFeedback} telemetry={telemetry} />
      ) : null}
    </Container>
  )
}

export default UsefulOrNot
