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
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdGitops.title')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.howNwhere.K8s.cdGitops.description')}
      </Text>
    </Layout.Vertical>
  )
}
