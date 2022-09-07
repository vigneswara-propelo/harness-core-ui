/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Text } from '@harness/uicore'
import type { ArtifactSource, PageConnectorResponse, PrimaryArtifact } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ModalViewFor } from '../../ArtifactHelper'
import type { ArtifactType } from '../../ArtifactInterface'
import PrimaryArtifactView from '../PrimaryArtifact/PrimaryArtifactView'
import css from '../../ArtifactsSelection.module.scss'

interface PrimaryArtifactSourcesProps {
  artifactSources: ArtifactSource[]
  isReadonly: boolean
  accountId: string
  fetchedConnectorResponse: PageConnectorResponse | undefined
  editArtifact: (view: ModalViewFor, type: ArtifactType, index: number) => void
  removeArtifactSource?: (index: number) => void
}
function PrimaryArtifactSources(props: PrimaryArtifactSourcesProps): React.ReactElement | null {
  const { artifactSources, editArtifact, removeArtifactSource, ...rest } = props
  const { getString } = useStrings()

  const renderIdentifier = (identifier: string): JSX.Element => {
    return (
      <div>
        <Text width={200} className={css.type} color={Color.BLACK} lineClamp={1}>
          {getString('sidecar')}
          <Text lineClamp={1} className={css.artifactId}>
            ({getString('common.ID')}: {identifier})
          </Text>
        </Text>
      </div>
    )
  }
  if (!artifactSources?.length) {
    return null
  }
  return (
    <>
      {artifactSources?.map((artifactSource, index) => (
        <PrimaryArtifactView
          key={artifactSource.identifier}
          primaryArtifact={artifactSource as PrimaryArtifact}
          editArtifact={(view, type) => editArtifact(view, type, index)}
          removePrimary={() => removeArtifactSource?.(index)}
          identifierElement={renderIdentifier(artifactSource.identifier)}
          {...rest}
        />
      ))}
    </>
  )
}

export default PrimaryArtifactSources
