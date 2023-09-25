import React, { useEffect } from 'react'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import { StoreMetadata } from '@common/constants/GitSyncTypes'
import { useStrings } from 'framework/strings'
import { useValidateTemplateInputsQuery } from 'services/pipeline-rq'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import css from './RunPipelineForm.module.scss'

interface PipelineOutOfSyncProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  pipelineIdentifier: string
  storeMetadata?: StoreMetadata
}

export default function PipelineOutOfSync({
  storeMetadata,
  accountId,
  orgIdentifier,
  projectIdentifier,
  pipelineIdentifier
}: PipelineOutOfSyncProps): React.ReactElement | null {
  const { getString } = useStrings()
  const [outOfSync, setOutOfSync] = React.useState(false)

  const {
    data: reconcileData,
    refetch: reconcilePipeline,
    isFetching: isFetchingReconcileData
  } = useValidateTemplateInputsQuery(
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        identifier: pipelineIdentifier,
        ...getGitQueryParamsWithParentScope({ storeMetadata, params: { accountId, orgIdentifier, projectIdentifier } })
      }
    },
    {
      enabled: false
    }
  )

  useEffect(() => {
    if (!isFetchingReconcileData && reconcileData?.data) {
      if (reconcileData.data.validYaml === false && reconcileData.data.errorNodeSummary) {
        setOutOfSync(true)
      } else {
        setOutOfSync(false)
      }
    }
  }, [reconcileData?.data, isFetchingReconcileData])

  useEffect(() => {
    reconcilePipeline()
  }, [])

  if (isFetchingReconcileData || !outOfSync) return null

  return (
    <Container className={css.outOfSyncContainer}>
      <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
        <Icon name="warning-sign" intent={Intent.DANGER} />
        <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.RED_600}>
          {getString('pipeline.runPipelineForm.outOfSync')}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}
