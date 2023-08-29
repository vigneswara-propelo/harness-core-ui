/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, PageError } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { PipelineType, ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { SRMAnalysisStepDetailDTO, useGetSRMAnalysisSummary } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { ReportHeader } from './Components/ReportHeader/ReportHeader'
import { ReportDetails } from './Components/ReportDetails/ReportDetails'
import { ReportSLIAndHealthSource } from './Components/ReportSLIAndHealthSource/ReportSLIAndHealthSource'

export default function ReportDrawer(props: SRMAnalysisStepDetailDTO): JSX.Element {
  const { executionDetailIdentifier } = props
  const { getString } = useStrings()

  const { accountId } = useParams<PipelineType<ExecutionPathProps>>()

  const {
    data: analysisSummary,
    loading: analysisLoading,
    error: analysisError
  } = useGetSRMAnalysisSummary({
    executionDetailId: executionDetailIdentifier,
    queryParams: { accountId }
  })

  const {
    stepName = '',
    environmentName = '',
    serviceName = '',
    analysisStatus = '',
    pipelinePath = ''
  } = analysisSummary?.resource || {}
  const title = `${getString('cv.analyzeDeploymentImpact.reportDrawer.title')}: ${stepName} `
  const analysisSummaryDetail = analysisSummary?.resource as SRMAnalysisStepDetailDTO

  return (
    <Container margin={'large'}>
      <ReportHeader
        name={title}
        url={pipelinePath}
        service={serviceName}
        environment={environmentName}
        status={analysisStatus}
        isLoading={analysisLoading}
      />
      <Container margin={{ top: 'medium', bottom: 'medium' }} height={1} background={Color.GREY_200} />
      {analysisError ? (
        <PageError message={getErrorMessage(analysisError)} />
      ) : (
        <>
          <ReportDetails {...analysisSummaryDetail} analysisLoading={analysisLoading} analysisError={analysisError} />
          <Container margin={{ top: 'medium', bottom: 'medium' }} height={1} background={Color.GREY_200} />
          <ReportSLIAndHealthSource {...analysisSummaryDetail} />
        </>
      )}
    </Container>
  )
}
