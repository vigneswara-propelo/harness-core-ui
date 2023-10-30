/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Container, Label, PillToggle } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import css from './VersionSelector.module.scss'

interface VersionSelectorProps {
  selectedVersion: YamlVersion
  onChange: React.Dispatch<React.SetStateAction<YamlVersion>>
  disabled?: boolean
}
function VersionSelector({ selectedVersion, onChange, disabled }: VersionSelectorProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container margin={{ bottom: 'medium' }}>
      <Label className={cx(Classes.LABEL, css.label)} data-tooltip-id={'pipelineYamlSyntax'}>
        {getString('pipeline.chooseYamlSyntax')}
      </Label>
      <PillToggle
        selectedView={selectedVersion}
        disableToggle={disabled}
        options={[
          {
            label: getString('pipeline.yamlVersion.v1'),
            value: YamlVersion[1]
          },
          {
            label: getString('pipeline.yamlVersion.v0'),
            value: YamlVersion[0]
          }
        ]}
        onChange={onChange}
        className={css.versionToggle}
      />
    </Container>
  )
}

export default VersionSelector
