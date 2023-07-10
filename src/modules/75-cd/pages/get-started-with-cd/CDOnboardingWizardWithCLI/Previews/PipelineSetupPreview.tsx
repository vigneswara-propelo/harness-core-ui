import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export default function PipelineSetupPreview(): JSX.Element {
  const { getString } = useStrings()

  return (
    <Layout.Vertical>
      <Layout.Horizontal margin={{ bottom: 'small' }}>
        <Text icon="main-tick" iconProps={{ color: Color.SUCCESS }} color={Color.BLACK}>
          {getString('cd.getStartedWithCD.flowbyquestions.deplopymentSteps.steps.step5.pipelinesuccess')}
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
