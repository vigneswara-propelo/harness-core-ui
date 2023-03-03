/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Classes, Dialog } from '@blueprintjs/core'
import { EvaluationView } from '@governance/EvaluationView'
import type { GitQueryParams, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { Evaluation } from 'services/pm'
import { RevalidateFooter } from './RevalidateFooter'
import css from '../ValidationBadge.module.scss'

interface ValidationFailureModalProps {
  isOpen: boolean
  policyEval?: Evaluation
  onClose: () => void
  onRevalidate: () => Promise<void>
}

export function ValidationFailureModal({
  isOpen,
  policyEval,
  onClose,
  onRevalidate
}: ValidationFailureModalProps): JSX.Element | null {
  const { accountId, module } = useParams<PipelineType<PipelinePathProps> & GitQueryParams>()
  const { getString } = useStrings()

  if (!policyEval) return null

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={getString('common.policiesSets.evaluations')}
      className={css.validationFailureModal}
      enforceFocus={false}
      canEscapeKeyClose
      canOutsideClickClose
    >
      <div className={css.validationFailureModalBody}>
        <EvaluationView
          metadata={policyEval}
          accountId={accountId}
          module={module}
          headingErrorMessage={getString('pipeline.policyEvaluations.failureHeadingEvaluationDetail')}
          headingWarningMessage={getString('pipeline.policyEvaluations.warningHeadingEvaluationDetail')}
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <RevalidateFooter onClose={onClose} onRevalidate={onRevalidate} />
      </div>
    </Dialog>
  )
}
