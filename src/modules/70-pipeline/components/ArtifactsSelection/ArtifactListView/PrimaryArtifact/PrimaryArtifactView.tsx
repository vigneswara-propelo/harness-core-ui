/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Button, getMultiTypeFromValue, Icon, Layout, MultiTypeInputType, Text, Container } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { PageConnectorResponse, PrimaryArtifact, SidecarArtifact } from 'services/cd-ng'
import type { TemplateSummaryResponse, NGTemplateInfoConfig } from 'services/template-ng'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { ArtifactIconByType, ArtifactTitleIdByType, ENABLED_ARTIFACT_TYPES, ModalViewFor } from '../../ArtifactHelper'
import ArtifactRepositoryTooltip from '../ArtifactRepositoryTooltip'
import type { ArtifactType } from '../../ArtifactInterface'
import { getArtifactLocation, showConnectorStep } from '../../ArtifactUtils'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactViewProps {
  primaryArtifact: PrimaryArtifact
  isReadonly: boolean
  accountId: string
  fetchedConnectorResponse: PageConnectorResponse | undefined
  editArtifact: (view: ModalViewFor, type?: ArtifactType, index?: number) => void
  removePrimary?: () => void
  identifierElement?: JSX.Element
  primaryArtifactRef?: string
}

interface ArtifactSourceTemplateViewProps {
  artifactSourceTemplateData: TemplateStepNode
  templateActionBtns: React.ReactElement | null
  primaryArtifactRef?: string
}

export function ArtifactSourceTemplateView(props: ArtifactSourceTemplateViewProps) {
  const { artifactSourceTemplateData, templateActionBtns, primaryArtifactRef } = props
  const { identifier, template } = artifactSourceTemplateData
  const [fetchedArtifactDetails, setFetchedArtifactDetails] = React.useState<PrimaryArtifact | SidecarArtifact>()
  const { getString } = useStrings()
  const handleFetchedTemplateDetails = React.useCallback((templateDetails: TemplateSummaryResponse) => {
    const artifactDetails = yamlParse<{ template: NGTemplateInfoConfig }>(defaultTo(templateDetails?.yaml, ''))
      ?.template?.spec as PrimaryArtifact | SidecarArtifact

    setFetchedArtifactDetails(artifactDetails)
  }, [])

  const artifactLocation = React.useMemo(
    () => fetchedArtifactDetails && getArtifactLocation(fetchedArtifactDetails),
    [fetchedArtifactDetails]
  )

  return (
    <section className={cx(css.rowItem, css.artifactSourceTemplateContainer, css.artifactRow)} key={'Dockerhub'}>
      <Layout.Horizontal
        className={css.templateEditWrapper}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} width={708}>
          <Container>
            {identifier && (
              <Layout.Horizontal spacing={'small'} width={200}>
                <Text padding={{ left: 'small' }} className={css.type} color={Color.BLACK} lineClamp={1}>
                  {identifier}
                </Text>
                {primaryArtifactRef && primaryArtifactRef === identifier && (
                  <Container className={css.primaryArtifactBadge}>
                    <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.TABLE_HEADERS }}>
                      {getString('primary')}
                    </Text>
                  </Container>
                )}
              </Layout.Horizontal>
            )}
          </Container>
          <Container>
            <TemplateBar
              className={css.minimalTemplateBar}
              templateLinkConfig={template}
              isReadonly={true}
              setFetchedTemplateDetails={handleFetchedTemplateDetails}
            />
          </Container>
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-end' }} style={{ flexGrow: 1 }}>
          {fetchedArtifactDetails && (
            <Container>
              <Text
                width={180}
                lineClamp={1}
                tooltip={<Text padding={'small'}>{artifactLocation}</Text>}
                color={Color.GREY_500}
              >
                <span>{artifactLocation}</span>
              </Text>
            </Container>
          )}
          {templateActionBtns}
        </Layout.Horizontal>
      </Layout.Horizontal>
    </section>
  )
}

function PrimaryArtifactView({
  primaryArtifact,
  isReadonly,
  accountId,
  fetchedConnectorResponse,
  editArtifact,
  removePrimary,
  identifierElement,
  primaryArtifactRef
}: PrimaryArtifactViewProps): React.ReactElement | null {
  const { getString } = useStrings()

  const artifactSourceTemplate = (primaryArtifact as TemplateStepNode)?.template

  const { color: primaryConnectorColor } = getStatus(
    primaryArtifact?.spec?.connectorRef,
    fetchedConnectorResponse,
    accountId
  )
  const primaryConnectorName = getConnectorNameFromValue(primaryArtifact?.spec?.connectorRef, fetchedConnectorResponse)

  const getPrimaryArtifactRepository = useCallback(
    (artifactType: ArtifactType): string => {
      if (artifactType === ENABLED_ARTIFACT_TYPES.CustomArtifact) {
        return getString('common.repo_provider.customLabel')
      }
      return defaultTo(primaryConnectorName, primaryArtifact?.spec?.connectorRef)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [primaryArtifact?.spec?.connectorRef, primaryConnectorName]
  )

  if (!primaryArtifact) {
    return null
  }

  const templateActionBtns = isReadonly ? null : (
    <Layout.Horizontal>
      <Button icon="Edit" minimal iconProps={{ size: 18 }} onClick={() => editArtifact(ModalViewFor.PRIMARY)} />
      <Button iconProps={{ size: 18 }} minimal icon="main-trash" onClick={removePrimary} />
    </Layout.Horizontal>
  )

  return !isEmpty(artifactSourceTemplate) ? (
    <ArtifactSourceTemplateView
      artifactSourceTemplateData={primaryArtifact as TemplateStepNode}
      templateActionBtns={templateActionBtns}
      primaryArtifactRef={primaryArtifactRef}
    />
  ) : (
    <section className={cx(css.artifactList, css.rowItem, css.artifactRow)}>
      {identifierElement ? (
        identifierElement
      ) : (
        <div>
          <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
            {getString('primary')}
          </Text>
        </div>
      )}
      {primaryArtifact.type ? (
        <>
          <div>{getString(ArtifactTitleIdByType[primaryArtifact.type])}</div>
          <div className={css.connectorNameField}>
            <Icon padding={{ right: 'small' }} name={ArtifactIconByType[primaryArtifact.type]} size={18} />
            <Text
              tooltip={
                <ArtifactRepositoryTooltip
                  artifactConnectorName={primaryConnectorName}
                  artifactConnectorRef={primaryArtifact.spec?.connectorRef}
                  artifactType={primaryArtifact.type}
                />
              }
              tooltipProps={{ isDark: true }}
              alwaysShowTooltip={showConnectorStep(primaryArtifact.type)}
              className={css.connectorName}
              lineClamp={1}
            >
              {getPrimaryArtifactRepository(primaryArtifact.type)}
            </Text>

            {getMultiTypeFromValue(primaryArtifact.spec?.connectorRef) === MultiTypeInputType.FIXED && (
              <Icon name="full-circle" size={8} color={primaryConnectorColor} />
            )}
          </div>
        </>
      ) : null}

      <div>
        <Text width={200} lineClamp={1} color={Color.GREY_500}>
          <span className={css.noWrap}>{getArtifactLocation(primaryArtifact)}</span>
        </Text>
      </div>
      {!isReadonly && (
        <Layout.Horizontal>
          <Button
            icon="Edit"
            minimal
            iconProps={{ size: 18 }}
            onClick={() => editArtifact(ModalViewFor.PRIMARY, primaryArtifact.type)}
          />
          <Button iconProps={{ size: 18 }} minimal icon="main-trash" onClick={removePrimary} />
        </Layout.Horizontal>
      )}
    </section>
  )
}

export default PrimaryArtifactView
