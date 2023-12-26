/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, Text, Layout } from '@harness/uicore'
import { defaultTo, merge, isEmpty } from 'lodash-es'
import type { MonacoEditorProps } from 'react-monaco-editor'
import { Color } from '@harness/design-system'
import MonacoEditor from '@common/components/MonacoEditor/MonacoEditor'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import { YamlVersionBadge } from '@pipeline/common/components/YamlVersionBadge/YamlVersionBadge'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import css from './TemplateYaml.module.scss'

export interface TemplateYamlProps {
  templateYaml: string
  yamlVersion?: YamlVersion
  withoutHeader?: boolean
  overrideEditorOptions?: MonacoEditorProps['options']
}

const DEFAULT_EDITOR_OPTIONS = {
  fontFamily: "'Roboto Mono', monospace",
  fontSize: 13,
  minimap: {
    enabled: false
  },
  readOnly: true,
  scrollbar: {
    handleMouseWheel: false
  },
  overviewRulerLanes: 0,
  scrollBeyondLastLine: false
} as MonacoEditorProps['options']

export function TemplateYaml({
  templateYaml,
  yamlVersion = '0',
  withoutHeader = false,
  overrideEditorOptions
}: TemplateYamlProps): React.ReactElement {
  const [height, setHeight] = React.useState<number>()
  const { CDS_YAML_SIMPLIFICATION } = useFeatureFlags()

  const editorOptions = useMemo(
    () =>
      isEmpty(overrideEditorOptions)
        ? DEFAULT_EDITOR_OPTIONS
        : merge({}, DEFAULT_EDITOR_OPTIONS, overrideEditorOptions),
    [overrideEditorOptions]
  )

  React.useEffect(() => {
    const stringifiedYaml = yamlStringify(templateYaml) as string
    setHeight((defaultTo(stringifiedYaml.match(/\n/g)?.length, 0) + 1) * 20)
  }, [templateYaml])

  return (
    <Container className={css.container}>
      <Layout.Vertical spacing={'medium'}>
        {!withoutHeader ? (
          <Container
            padding={{ top: 'large', right: 'xxlarge', bottom: 'large', left: 'xxlarge' }}
            border={{ bottom: true }}
            background={Color.WHITE}
            flex={{ align: 'center-center', justifyContent: 'left' }}
            style={{ columnGap: '8px' }}
          >
            <Text inline font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
              template.yaml
            </Text>
            {CDS_YAML_SIMPLIFICATION && <YamlVersionBadge version={yamlVersion} minimal border />}
          </Container>
        ) : null}
        <Container style={{ flexGrow: 1 }}>
          <MonacoEditor value={templateYaml} language={'yaml'} height={height} options={editorOptions} />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
