/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, forEach, includes, map } from 'lodash-es'
import { GovernanceMetadata } from 'services/cd-ng'
import { Evaluation } from 'services/pm'
import { EvaluationStatus, IacmFormattedData } from './types'

const defaultEmpty = (value: unknown): string => defaultTo(value, '') as string

const formatIacmGovernanceData = (
  data?: Evaluation[]
): {
  iacmData: IacmFormattedData[]
  iacmStatus: EvaluationStatus
} => {
  const iacmData: IacmFormattedData[] = []
  let status: EvaluationStatus = EvaluationStatus.PASS
  const statuses: EvaluationStatus[] = []
  forEach(data, ({ id, details }) =>
    forEach(details, policySet => {
      statuses.push(defaultTo(policySet.status as EvaluationStatus, EvaluationStatus.PASS))
      iacmData.push({
        policySetId: defaultEmpty(policySet.identifier),
        policySetName: defaultEmpty(policySet.name),
        status: defaultEmpty(policySet.status),
        identifier: defaultEmpty(policySet.identifier),
        created: defaultEmpty(policySet.created),
        accountId: defaultEmpty(policySet.account_id),
        orgId: defaultEmpty(policySet.org_id),
        projectId: defaultEmpty(policySet.project_id),
        policyMetadata: map(policySet.details, policy => ({
          id,
          policyId: defaultEmpty(policy?.policy?.identifier),
          policyName: defaultEmpty(policy?.policy?.name),
          severity: defaultEmpty(policySet.status),
          denyMessages: policy?.deny_messages,
          status: defaultEmpty(policySet.status),
          identifier: defaultEmpty(policy?.policy?.identifier),
          accountId: defaultEmpty(policySet.account_id),
          orgId: defaultEmpty(policySet.org_id),
          projectId: defaultEmpty(policySet.project_id),
          created: defaultEmpty(policySet.created),
          updated: defaultEmpty(policySet.updated)
        }))
      })
    })
  )

  if (includes(statuses, EvaluationStatus.ERROR)) {
    status = EvaluationStatus.ERROR
  } else if (includes(statuses, EvaluationStatus.WARNING)) {
    status = EvaluationStatus.WARNING
  }
  return { iacmData, iacmStatus: status }
}

export const formatMetaData = (
  isLoading: boolean,
  IACM_ENABLED: boolean,
  governanceMetadata?: GovernanceMetadata,
  data?: Evaluation[]
): GovernanceMetadata => {
  const details: IacmFormattedData[] = []
  let govData = {
    status: EvaluationStatus.PASS,
    id: null,
    details
  }

  if (governanceMetadata) {
    const { details: opaDetails, status: opaStatus, id } = governanceMetadata
    govData = {
      details: opaDetails,
      status: opaStatus,
      id
    }
  }

  if (!IACM_ENABLED) return govData

  const { iacmData, iacmStatus } = formatIacmGovernanceData(data)
  if (iacmData && !isLoading) {
    govData.details = [...defaultTo(govData.details, []), ...iacmData]
  }

  if (iacmStatus !== govData.status) {
    if (govData.status === EvaluationStatus.ERROR || iacmStatus === EvaluationStatus.ERROR) {
      govData.status = EvaluationStatus.ERROR
    } else if (govData.status === EvaluationStatus.WARNING || iacmStatus === EvaluationStatus.WARNING) {
      govData.status = EvaluationStatus.WARNING
    } else {
      govData.status = EvaluationStatus.PASS
    }
  }

  return govData
}
