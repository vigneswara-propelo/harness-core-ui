/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Button, ButtonSize, ButtonVariation, Icon, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance, UseTableCellProps } from 'react-table'
import { defaultTo, get } from 'lodash-es'
import { useArtifactnewSbomQuery } from '@harnessio/react-ssca-service-client'
import { useParams } from 'react-router-dom'
import { useDownloadSbomQuery } from '@harnessio/react-ssca-manager-client'
import { useStrings } from 'framework/strings'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { Artifact, ArtifactsColumnActions } from './ArtifactsTable'
import css from './ArtifactsTable.module.scss'

export function downloadBlob(content: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  setTimeout(() => {
    URL.revokeObjectURL(url)
    a.remove()
  }, 150)

  a.click()
}

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & ArtifactsColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<Artifact>>

export interface CellTypeRegister {
  component: React.ComponentType<UseTableCellProps<Artifact>>
}

export const ArtifactCell: CellType = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall">
      <a href={data.url} target="_blank" rel="noopener noreferrer">
        <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
          {data.imageName || data.url}
        </Text>
      </a>
      {data?.tag && (
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
          {`${getString('common.artifactTag')}: ${data.tag}`}
        </Text>
      )}
    </Layout.Vertical>
  )
}

export const PipelineStepCell: CellType = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall">
      <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1}>
        {data.node?.name}
      </Text>

      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
        {`${getString('common.stage').toLowerCase()}: ${data.stage}`}
      </Text>
    </Layout.Vertical>
  )
}

export const ViolationsCell: CellType = ({ row, column }) => {
  const { getString } = useStrings()
  const data = row.original

  const totalViolations = defaultTo(data?.allowListViolationCount, 0) + defaultTo(data?.denyListViolationCount, 0)
  return data?.type === 'SBOM' && totalViolations > 0 ? (
    <Button
      className={css.action}
      variation={ButtonVariation.LINK}
      text={totalViolations}
      size={ButtonSize.SMALL}
      onClick={() => column.showEnforcementViolations(data.stepExecutionId)}
    />
  ) : (
    <Text font={{ variation: FontVariation.SMALL }} lineClamp={2}>
      {data?.type === 'SBOM' && data.node?.stepType === 'SscaEnforcement' ? 0 : getString('na')}
    </Text>
  )
}

export const TypeCell: CellType = ({ row }) => {
  const artifact = row.original
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const SSCA_MANAGER_ENABLED = useFeatureFlag(FeatureFlag.SSCA_MANAGER_ENABLED)

  const queryOld = useArtifactnewSbomQuery(
    {
      artifactId: defaultTo(artifact.id, ''),
      stepExecutionId: defaultTo(artifact.stepExecutionId, ''),
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      }
    },
    {
      onSuccess: _data => downloadBlob(get(_data.content.sbom, ''), `${artifact.sbomName}_${artifact.tag}_sbom.json`),
      enabled: false,
      retry: false
    }
  )

  const query = useDownloadSbomQuery(
    {
      org: orgIdentifier,
      project: projectIdentifier,
      'orchestration-id': artifact.stepExecutionId || ''
    },
    {
      enabled: false,
      retry: false,
      onSuccess: _data => downloadBlob(get(_data.content.sbom, ''), `${artifact.sbomName}_${artifact.tag}_sbom.json`)
    }
  )

  const { getString } = useStrings()

  return (
    <>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} lineClamp={1} margin={{ bottom: 'xsmall' }}>
        {artifact.type}
      </Text>
      {artifact.sbomName && (
        <Button
          className={css.action}
          variation={ButtonVariation.LINK}
          size={ButtonSize.SMALL}
          onClick={() => (SSCA_MANAGER_ENABLED ? query.refetch() : queryOld.refetch())}
          loading={SSCA_MANAGER_ENABLED ? query.isFetching : queryOld.isInitialLoading}
        >
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
            <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
              {artifact.sbomName}
            </Text>
            <Icon size={12} name="import" color={Color.PRIMARY_7} />
          </Layout.Horizontal>
        </Button>
      )}
      {artifact.provenance && (
        <Button
          className={css.action}
          variation={ButtonVariation.LINK}
          size={ButtonSize.SMALL}
          onClick={() =>
            downloadBlob(
              JSON.stringify(get(artifact, 'provenance', {}), null, 2),
              `${get(
                artifact,
                'provenance.predicate.buildDefinition.internalParameters.pipelineExecutionId',
                ''
              )}_slsa_provenance.json`
            )
          }
        >
          <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
            <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
              {getString('pipeline.slsaProvenance')}
            </Text>
            <Icon size={12} name="import" color={Color.PRIMARY_7} />
          </Layout.Horizontal>
        </Button>
      )}
    </>
  )
}

export const SLSAVerificationCell: CellType = ({ row }) => {
  const { getString } = useStrings()
  const data = row.original
  // Verify attestation -> Evaluate policy
  type SlsaVerifyAttestationStatusType = 'SUCCESS' | 'FAILURE'
  const slsaVerifyAttestationStatusMap: Record<SlsaVerifyAttestationStatusType, string> = {
    SUCCESS: getString('passed'),
    FAILURE: getString('failed')
  }
  const _slsaVerifyAttestationStatus: SlsaVerifyAttestationStatusType = get(
    data.node,
    `outcomes.output.outputVariables.SLSA_VERIFY_ATTESTATION_${data.node?.uuid}`,
    ''
  )
  const slsaVerifyAttestationStatus = slsaVerifyAttestationStatusMap[_slsaVerifyAttestationStatus]

  const policyEvaluationStatus = get(
    data.node,
    `outcomes.policyOutput.status`,
    getString('pipeline.policyNotConfigured')
  )

  return data.node?.stepType === StepType.SlsaVerification ? (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.SMALL_SEMI }}>
        {_slsaVerifyAttestationStatus === 'SUCCESS' ? policyEvaluationStatus : getString('failed')}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} lineClamp={1}>
        {slsaVerifyAttestationStatus
          ? `${getString('pipeline.attestationVerification')}: ${slsaVerifyAttestationStatus}`
          : getString('pipeline.executionFailed')}
      </Text>
    </Layout.Vertical>
  ) : (
    getString('na')
  )
}
