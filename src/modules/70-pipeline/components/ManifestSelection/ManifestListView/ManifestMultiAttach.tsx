/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import useFileStoreModal from '@filestore/components/FileStoreComponent/FileStoreComponent'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { ManifestStoreMap, ManifestToPathLabelMap, PathType } from '../Manifesthelper'
import type { ManifestStores, PrimaryManifestType } from '../ManifestInterface'

import { LocationValue } from '../../ConfigFilesSelection/ConfigFilesListView/LocationValue'

import css from '../ManifestSelection.module.scss'
import cssMulti from './ManifestListViewMultiple.module.scss'

interface MultiAttachPathYamlFlowType {
  manifestType: PrimaryManifestType
  manifestStore: ManifestStores
  valuesPaths: string[]
  paths: string[]
}

interface RenderAttachType {
  valuesPathValue: string
  index: number
  type: PathType
}

function ManifestMultiAttach({
  manifestType,
  manifestStore,
  valuesPaths,
  paths
}: MultiAttachPathYamlFlowType): React.ReactElement | null {
  const { getString } = useStrings()

  const FileStoreModal = useFileStoreModal({ isReadonly: true, fileUsage: FileUsage.MANIFEST_FILE })

  const isFixedValuesPaths = getMultiTypeFromValue(valuesPaths) === MultiTypeInputType.FIXED
  const isFixedPaths = getMultiTypeFromValue(paths) === MultiTypeInputType.FIXED

  const getAttachNameByType = (type: PathType): string => {
    switch (type) {
      case PathType.PATH:
        return getString('pipelineSteps.manifestPathLabel')
      case PathType.VALUE:
        return getString('pipeline.manifestType.associatedValues')
      default:
        return ''
    }
  }

  function RenderAttachList({ valuesPathValue, index, type }: RenderAttachType): React.ReactElement {
    return (
      <section key={`${valuesPathValue}-${index}`}>
        <div className={cx(css.valuesPathList, cssMulti.manifestAttachItem)}>
          <div className={cssMulti.pathLine} />
          <Layout.Horizontal style={{ maxWidth: '100%' }}>
            <Text margin={{ left: 'small', right: 'small' }} color={Color.GREY_300}>
              {getAttachNameByType(type)}
            </Text>
            <LocationValue
              onClick={(path: string, scope: string) => FileStoreModal.openFileStoreModal(path, scope)}
              isHarnessStore={manifestStore === ManifestStoreMap.Harness}
              isTooltip={false}
              locations={[valuesPathValue]}
              isManifest
              directPath={valuesPathValue}
            />
          </Layout.Horizontal>
        </div>
      </section>
    )
  }

  return (
    <section className={css.valuesList}>
      {isFixedPaths ? (
        paths?.map((pathValue: string, index: number) => (
          <RenderAttachList valuesPathValue={pathValue} index={index} key={`path-${index}`} type={PathType.PATH} />
        ))
      ) : (
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text inline>
            {`${ManifestToPathLabelMap[manifestType] && getString(ManifestToPathLabelMap[manifestType])}: ${paths}`}
          </Text>
        </Layout.Horizontal>
      )}
      {isFixedValuesPaths ? (
        valuesPaths?.map((valuesPathValue: string, index: number) => (
          <RenderAttachList valuesPathValue={valuesPathValue} index={index} key={index} type={PathType.VALUE} />
        ))
      ) : (
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Text inline>
            {`${
              ManifestToPathLabelMap[manifestType] && getString(ManifestToPathLabelMap[manifestType])
            }: ${valuesPaths}`}
          </Text>
        </Layout.Horizontal>
      )}
    </section>
  )
}

export default ManifestMultiAttach
