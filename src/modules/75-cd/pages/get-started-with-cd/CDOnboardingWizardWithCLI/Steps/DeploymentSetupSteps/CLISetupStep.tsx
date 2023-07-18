/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, RadioButtonGroup, Tab, Tabs, Text } from '@harness/uicore'
import { once } from 'lodash-es'
import { Color, FontVariation } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { getCommandStrWithNewline } from '../../utils'
import ApiKeySetup from './ApiKeySetup'
import { SYSTEM_ARCH_TYPES } from '../../Constants'
import type { ApiKeySetupProps, PipelineSetupState } from '../../types'
import css from '../../CDOnboardingWizardWithCLI.module.scss'

export default function CLISetupStep({
  onKeyGenerate,
  state
}: ApiKeySetupProps & { state: PipelineSetupState }): JSX.Element {
  return (
    <Layout.Vertical className={css.deploymentSteps}>
      <Layout.Vertical margin={{ bottom: 'xlarge' }}>
        <Text className={css.bold} color={Color.BLACK} padding={{ top: 'large' }}>
          <String
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.stepsTitle"
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'large' }}>
          <String
            color={Color.BLACK}
            className={css.marginBottomLarge}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.stepsIntro"
            useRichText
            vars={{ sampleAppURL: 'https://github.com/harness-community/harnesscd-example-apps/' }}
          />
        </Text>
        <Text color={Color.BLACK} padding={{ top: 'large', bottom: 'large' }}>
          <String stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.stepsIntro2" />
        </Text>
        <Text color={Color.BLACK} font={{ variation: FontVariation.FORM_TITLE }}>
          <String
            color={Color.BLACK}
            stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.headsteps.preparation"
          />
        </Text>
        <ApiKeySetup state={state} onKeyGenerate={onKeyGenerate} />
      </Layout.Vertical>
      <InstallCLIInfo />
      <Layout.Vertical>
        <Text className={css.bold} color={Color.BLACK} padding={{ top: 'large' }}>
          <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
            <String
              useRichText
              className={css.marginBottomLarge}
              stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step3.title"
            />
          </Text>
        </Text>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

function InstallCLIInfo(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} padding={{ top: 'xlarge' }}>
        <String
          className={css.marginBottomLarge}
          stringID="cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.title"
        />
      </Text>
      <Tabs id="selectedOS" className={css.tabsLine}>
        <Tab
          id="mac"
          title="macOs"
          panel={
            <CommandBlock
              darkmode
              allowCopy={true}
              commandSnippet={getCommandStrWithNewline([
                getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.mac'),
                getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.mvharness'),
                getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.chmod')
              ])}
              ignoreWhiteSpaces={false}
              downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
              copyButtonText={getString('common.copy')}
            />
          }
        />
        <Tab id="linux" title={getString('delegate.cardData.linux.name')} panel={<CLIDownloadLinux />} />
        <Tab
          id="win"
          title="Windows"
          panel={
            <CommandBlock
              darkmode
              allowCopy={true}
              commandSnippet={getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.win')}
              ignoreWhiteSpaces={true}
              downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
              copyButtonText={getString('common.copy')}
            />
          }
        />
      </Tabs>
    </Layout.Vertical>
  )
}

const CLIDownloadLinux = (): JSX.Element => {
  const { getString } = useStrings()
  const [selectedValue, setSelectedValue] = React.useState<string>('ARM')
  const getOptions = once(
    (): {
      label: string
      value: string
    }[] => {
      return Object.entries(SYSTEM_ARCH_TYPES).map(([key, val]: string[]) => ({ label: val, value: key }))
    }
  )

  const getCommands = (): string => {
    return getCommandStrWithNewline([
      getString(
        selectedValue === SYSTEM_ARCH_TYPES.ARM
          ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.arm'
          : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.amd'
      ),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.mvharness'),
      getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.step2.chmod')
    ])
  }
  return (
    <Layout.Vertical>
      <RadioButtonGroup
        asPills
        margin={{ bottom: 'medium' }}
        options={getOptions()}
        selectedValue={selectedValue}
        onChange={e => {
          setSelectedValue(e.currentTarget.value)
        }}
      />
      <CommandBlock
        darkmode
        allowCopy
        ignoreWhiteSpaces={false}
        commandSnippet={getCommands()}
        downloadFileProps={{ downloadFileName: 'harness-cli-install-steps', downloadFileExtension: 'xdf' }}
        copyButtonText={getString('common.copy')}
      />
    </Layout.Vertical>
  )
}
