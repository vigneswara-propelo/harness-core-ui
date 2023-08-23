/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { GITOPS_DOCS_LINKS } from '../../Constants'
import MissingSwimlane from '../MissingSwimlane'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function GitopsFlow({ artifactType }: { artifactType: string }): JSX.Element {
  const { getString } = useStrings()

  const docsLink = GITOPS_DOCS_LINKS[artifactType]
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.description')}
      </Text>

      {docsLink && <MissingSwimlane url={docsLink} />}
    </Layout.Vertical>
  )
}
