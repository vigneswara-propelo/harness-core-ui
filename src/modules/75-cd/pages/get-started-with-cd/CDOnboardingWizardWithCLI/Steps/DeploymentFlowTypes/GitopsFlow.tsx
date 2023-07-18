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
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function GitopsFlow(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowByQuestions.howNwhere.K8s.cdGitops.description')}
      </Text>
    </Layout.Vertical>
  )
}
