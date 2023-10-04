/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Card,
  Formik,
  FormInput,
  HarnessDocTooltip,
  Heading,
  Icon,
  Layout,
  Text
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import * as Yup from 'yup'
import { isEmpty, omit, unset } from 'lodash-es'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import {
  UpdatePipelineMetaData,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useGetAuthSettings } from 'framework/hooks/useGetAuthSettings'
import { useVariablesExpression } from '../PiplineHooks/useVariablesExpression'
import DelegateSelectorPanel from '../../PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'
import { PublicAccessResponseType } from '../PipelineContext/PipelineActions'
import css from './AdvancedOptions.module.scss'

interface AdvancedOptionsProps {
  onApplyChanges: (data: PipelineInfoConfig, metadata?: UpdatePipelineMetaData) => void
  onDiscard: () => void
  pipeline: PipelineInfoConfig
}

const stageExecutionOptions = [
  {
    label: 'Yes',
    value: true
  },
  {
    label: 'No',
    value: false
  }
]

interface AdvancedOptionFormProps extends PipelineInfoConfig {
  publicAccessResponse?: PublicAccessResponseType
}

export function AdvancedOptions({ onApplyChanges, onDiscard, pipeline }: AdvancedOptionsProps): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { isCurrentSessionPublic, isPublicAccessEnabledOnResources, updateAppStore } = useAppStore()
  const {
    state: { pipelineMetadataConfig },
    setPublicAccessResponse
  } = usePipelineContext()
  const { refetchAuthSettings, authSettings } = useGetAuthSettings()

  React.useEffect(() => {
    refetchAuthSettings()
  }, [refetchAuthSettings])

  React.useEffect(() => {
    if (
      !isCurrentSessionPublic &&
      authSettings?.resource &&
      authSettings.resource.publicAccessEnabled !== isPublicAccessEnabledOnResources
    ) {
      updateAppStore({
        isPublicAccessEnabledOnResources: !!authSettings.resource.publicAccessEnabled
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSettings, isPublicAccessEnabledOnResources])

  const onSubmit = React.useCallback(
    async (data: AdvancedOptionFormProps) => {
      if (isEmpty(data.timeout)) {
        unset(data, 'timeout')
      }
      if (isEmpty(data.delegateSelectors) || data.delegateSelectors?.[0] === '') {
        unset(data, 'delegateSelectors')
      }
      setPublicAccessResponse(data?.publicAccessResponse as PublicAccessResponseType)
      onApplyChanges(omit(data, 'publicAccessResponse'), { publicAccess: data?.publicAccessResponse })
    },
    [onApplyChanges, setPublicAccessResponse]
  )
  const { isReadonly } = usePipelineContext()
  return (
    <Formik<AdvancedOptionFormProps>
      formName="pipelineAdvancedOptions"
      validationSchema={Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' })
      })}
      initialValues={{
        ...pipeline,
        publicAccessResponse: pipelineMetadataConfig?.modifiedMetadata?.publicAccessResponse
      }}
      onSubmit={onSubmit}
    >
      {formikProps => (
        <>
          <Page.Header
            title={
              <Layout.Horizontal spacing="small" flex={{ justifyContent: 'center' }}>
                <Icon name="pipeline-advanced" color={Color.PRIMARY_7} size={24} />
                <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.advancedOptions')}</Text>
              </Layout.Horizontal>
            }
            toolbar={
              <Layout.Horizontal>
                <Button variation={ButtonVariation.SECONDARY} size={ButtonSize.SMALL} onClick={formikProps.submitForm}>
                  {getString('applyChanges')}
                </Button>
                <Button variation={ButtonVariation.LINK} size={ButtonSize.SMALL} onClick={() => onDiscard()}>
                  {getString('common.discard')}
                </Button>
              </Layout.Horizontal>
            }
          />
          <Page.Body className={css.body}>
            <Layout.Vertical spacing="small" margin={{ bottom: 'large' }}>
              <Heading level={5} color={Color.GREY_900} data-tooltip-id="pipelineCreate_timeout">
                {getString('pipeline.pipelineTimeoutSettings')}
                <HarnessDocTooltip useStandAlone={true} tooltipId="pipelineCreate_timeout" />
              </Heading>

              <Card>
                <Layout.Vertical spacing="small">
                  <Text
                    color={Color.GREY_600}
                    style={{ marginBottom: 4 }}
                    font={{ variation: FontVariation.SMALL_SEMI }}
                  >
                    {getString('pipeline.pipelineTimeoutHelpText')}
                  </Text>
                  <FormMultiTypeDurationField
                    name="timeout"
                    isOptional
                    style={{ width: 320 }}
                    label={getString('pipelineSteps.timeoutLabel')}
                    multiTypeDurationProps={{ enableConfigureOptions: true, expressions }}
                  />
                </Layout.Vertical>
              </Card>
            </Layout.Vertical>

            <Layout.Vertical spacing="small" margin={{ bottom: 'large' }}>
              <Heading level={5} color={Color.GREY_900} data-tooltip-id="stageExecution_settings">
                {getString('pipeline.stageExecutionSettings')}
                <HarnessDocTooltip useStandAlone={true} tooltipId="stageExecution_settings" />
              </Heading>

              <Card>
                <Layout.Vertical spacing="small">
                  <Text
                    color={Color.GREY_600}
                    style={{ marginBottom: 4 }}
                    font={{ variation: FontVariation.SMALL_SEMI }}
                  >
                    {getString('pipeline.stageExecutionsHelperText')}
                  </Text>
                  <FormInput.RadioGroup
                    name="allowStageExecutions"
                    radioGroup={{ inline: true }}
                    items={stageExecutionOptions as any}
                    onChange={e => {
                      const currentValue = e.currentTarget?.value === 'true'
                      formikProps?.setFieldValue('allowStageExecutions', currentValue)
                    }}
                  />
                </Layout.Vertical>
              </Card>
            </Layout.Vertical>

            <Layout.Vertical spacing="small" margin={{ bottom: 'large' }}>
              <Heading level={5} color={Color.GREY_900} data-tooltip-id="delegateSelector">
                {getString('pipeline.delegate.DelegateSelectorOptional')}
              </Heading>
              <Card>
                <Layout.Vertical spacing="small">
                  <DelegateSelectorPanel isReadonly={isReadonly} />
                </Layout.Vertical>
              </Card>
            </Layout.Vertical>

            {isPublicAccessEnabledOnResources && (
              <Layout.Vertical spacing="small" margin={{ bottom: 'large' }}>
                <Heading level={5} color={Color.GREY_900} data-tooltip-id="pipeline-public-access">
                  {`${getString('platform.authSettings.publicAccess.publicAccess')} ${getString(
                    'common.optionalLabel'
                  )}`}
                  <HarnessDocTooltip useStandAlone={true} tooltipId="pipeline-public-access" />
                </Heading>
                <Card>
                  <FormInput.Toggle
                    name="publicAccessResponse.public"
                    label={getString('pipeline.markPipelinePublic')}
                    disabled={isReadonly}
                    data-testid="toggle-mark-pipeline-public"
                  />
                </Card>
              </Layout.Vertical>
            )}
          </Page.Body>
        </>
      )}
    </Formik>
  )
}
