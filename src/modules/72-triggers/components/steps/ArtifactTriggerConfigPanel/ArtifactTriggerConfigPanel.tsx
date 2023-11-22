/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { NameIdDescriptionTags } from '@common/components'

import { useStrings } from 'framework/strings'
import StageSelection from '@triggers/components/StageSelection/StageSelection'

import { TriggerCatalogType, TriggerCatalogTypeToLabelMap } from '@triggers/pages/triggers/utils/TriggersListUtils'
import ArtifactsSelection from './ArtifactsSelection/ArtifactsSelection'

import css from './ArtifactTriggerConfigPanel.module.scss'
export interface ArtifactTriggerConfigPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

const ArtifactTriggerConfigPanel: React.FC<ArtifactTriggerConfigPanelPropsInterface> = ({
  formikProps,
  isEdit = false
}) => {
  const { getString } = useStrings()

  const artifactText = getString('pipeline.artifactTriggerConfigPanel.artifact')
  const artifactType = formikProps?.values?.source?.spec?.type as TriggerCatalogType
  const artifactName = artifactType ? getString(TriggerCatalogTypeToLabelMap[artifactType]) : ''

  return (
    <Layout.Vertical className={css.artifactTriggerConfigContainer} padding="xxlarge">
      <div className={css.formContent}>
        <NameIdDescriptionTags
          className={css.nameIdDescriptionTags}
          formikProps={formikProps}
          identifierProps={{
            isIdentifierEditable: !isEdit
          }}
          tooltipProps={{
            dataTooltipId: 'artifactTrigger'
          }}
        />
      </div>
      <Text className={css.formContentTitle} inline={true} tooltipProps={{ dataTooltipId: 'listenNewArtifact' }}>
        {getString('pipeline.artifactTriggerConfigPanel.listenOnNewArtifact', {
          artifact: `${artifactName} ${artifactText}`
        })}
      </Text>
      <div className={css.formContent}>
        <ArtifactsSelection formikProps={formikProps} />
      </div>
      <StageSelection formikProps={formikProps} />
    </Layout.Vertical>
  )
}

export default ArtifactTriggerConfigPanel
