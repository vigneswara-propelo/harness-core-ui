import React from 'react'
import { IconName, IconProps, Layout, Text } from '@harness/uicore'
import { Spacing } from '@harness/design-system'

interface TextList {
  icon?: IconName
  text: string
  iconProps?: Partial<IconProps>
}

function StatusList({ textList, spacing }: { textList?: TextList[]; spacing?: Spacing }): JSX.Element {
  return (
    <Layout.Vertical spacing={'large' || spacing} margin={{ top: 'large' }}>
      {textList?.map((data: TextList) => (
        <Text key={data.text} icon={data.icon} iconProps={data?.iconProps}>
          {data.text}
        </Text>
      ))}
    </Layout.Vertical>
  )
}

export default StatusList
