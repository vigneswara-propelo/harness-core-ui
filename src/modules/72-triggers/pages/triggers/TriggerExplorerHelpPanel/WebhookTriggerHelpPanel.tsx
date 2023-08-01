import React, { useMemo } from 'react'
import { Icon, IconName } from '@harness/icons'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from '../views/TriggerExplorer.module.scss'

interface WebhookInfo {
  iconName: IconName
  info: string
}

export const WebhookTriggerHelpPanel = (): JSX.Element => {
  const { getString } = useStrings()
  const steps: WebhookInfo[] = useMemo(
    () => [
      {
        iconName: 'terminal',
        info: getString('triggers.triggerExplorer.webhookHelp.step1')
      },
      {
        iconName: 'governance-policy-set',
        info: getString('triggers.triggerExplorer.webhookHelp.step2')
      },

      {
        iconName: 'trigger-stack',
        info: getString('triggers.triggerExplorer.webhookHelp.step3')
      }
    ],
    [getString]
  )
  return (
    <Layout.Horizontal padding={{ top: 'large', left: 'xlarge' }} width={'90%'}>
      {steps.map((item: WebhookInfo, index: number) => {
        const { iconName, info } = item
        return (
          <Layout.Horizontal key={iconName} spacing={'medium'} flex={{ alignItems: 'center' }} width={'36%'}>
            <div className={css.helpPanelIconBg}>
              <Icon name={iconName} size={24} color={Color.AI_PURPLE_600} />
            </div>
            <Text style={{ flex: 1 }}>{info}</Text>
            {index !== steps.length - 1 && <Icon name={'right-arrow'} size={55} color={Color.AI_PURPLE_400} />}
          </Layout.Horizontal>
        )
      })}
    </Layout.Horizontal>
  )
}
