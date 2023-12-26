/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty, isEqual } from 'lodash-es'
import { parse } from 'yaml'
import { ButtonVariation, Checkbox, Container, Tag } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useGetTemplateSchemaQuery } from '@harnessio/react-template-service-client'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useEnableEditModes } from '@pipeline/components/PipelineStudio/hooks/useEnableEditModes'
import { TemplateTypesY1 } from '@templates-library/components/TemplateStudio/TemplateStudioUtils'
import { TemplateContextY1 } from '../TemplateContext/TemplateContextY1'
import css from './TemplateYamlViewY1.module.scss'

export const POLL_INTERVAL = 1000 /* ms */

let Interval: number | undefined
const defaultFileName = 'Template.yaml'

const TemplateYamlViewY1: React.FC = () => {
  const {
    state: {
      template,
      templateMetadata,
      templateView: { isDrawerOpened, isYamlEditable },
      templateView,
      templateYaml
      //entityValidityDetails: { valid }
    },
    updateTemplateView,
    isReadonly,
    updateTemplate,
    setYamlHandler: setYamlHandlerContext
  } = React.useContext(TemplateContextY1)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [yamlFileName, setYamlFileName] = React.useState<string>(defaultFileName)
  const { getString } = useStrings()
  const { preference, setPreference: setYamlAlwaysEditMode } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'TemplateYamlAlwaysEditMode'
  )
  const userPreferenceEditMode = React.useMemo(() => defaultTo(Boolean(preference === 'true'), false), [preference])
  const { enableEditMode } = useEnableEditModes()
  const { expressions } = useVariablesExpression()
  const { DISABLE_TEMPLATE_SCHEMA_VALIDATION: isTemplateSchemaValidationDisabled } = useFeatureFlags()
  const expressionRef = React.useRef<string[]>([])
  expressionRef.current = expressions

  // setup polling
  React.useEffect(() => {
    if (yamlHandler && !isDrawerOpened) {
      Interval = window.setInterval(() => {
        try {
          const templateFromYaml = parse(yamlHandler.getLatestYaml())
          const schemaValidationErrorMap = yamlHandler.getYAMLValidationErrorMap()
          const areSchemaValidationErrorsAbsent = !(schemaValidationErrorMap && schemaValidationErrorMap.size > 0)
          if (
            !isEqual(template, templateFromYaml) &&
            !isEmpty(templateFromYaml) &&
            areSchemaValidationErrorsAbsent // Don't update for Invalid Yaml
          ) {
            updateTemplate(templateFromYaml)
          }
        } catch (e) {
          // Ignore Error
        }
      }, POLL_INTERVAL)
      return () => {
        window.clearInterval(Interval)
      }
    } else {
      return void 0
    }
  }, [yamlHandler, template, isDrawerOpened])

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  React.useEffect(() => {
    setYamlFileName(templateMetadata.identifier + '.yaml')
  }, [templateMetadata.identifier])

  React.useEffect(() => {
    if (userPreferenceEditMode) {
      updateTemplateView({ ...templateView, isYamlEditable: true })
    }
  }, [userPreferenceEditMode])

  const { data: templateStaticSchema } = useGetTemplateSchemaQuery(
    {
      queryParams: {
        node_group: TemplateTypesY1[template?.spec?.type as keyof typeof TemplateTypesY1],
        node_type: template.spec?.spec?.type, // TODO: check this: || template.spec?.stageType,
        version: 'v1'
      }
    },
    {
      enabled: !isTemplateSchemaValidationDisabled && !__DEV__
    }
  )

  const templateSchema = templateStaticSchema?.content

  const onEditButtonClick = async (): Promise<void> => {
    try {
      const isAlwaysEditModeEnabled = await enableEditMode()
      updateTemplateView({ ...templateView, isYamlEditable: true })
      setYamlAlwaysEditMode(String(isAlwaysEditModeEnabled))
    } catch (_) {
      // Ignore.. use cancelled enabling edit mode
    }
  }

  return (
    <div className={css.yamlBuilder}>
      <>
        {!isDrawerOpened && (
          <YamlBuilderMemo
            key={isYamlEditable.toString()}
            fileName={defaultTo(yamlFileName, defaultFileName)}
            entityType="Template"
            //isReadOnlyMode={isReadonly || !isYamlEditable}
            existingJSON={template}
            //existingYaml={!valid ? templateYaml : undefined}
            existingYaml={templateYaml}
            bind={setYamlHandler}
            schema={templateSchema?.data}
            onExpressionTrigger={() =>
              Promise.resolve(
                expressionRef.current.map(item => ({
                  label: item,
                  insertText: `${item}>`,
                  kind: 1,
                  detail: `<+${item}}>`
                }))
              )
            }
            yamlSanityConfig={{ removeEmptyString: false, removeEmptyObject: false, removeEmptyArray: false }}
            height={'calc(100vh - 200px)'}
            width="calc(100vw - 400px)"
            invocationMap={factory.getInvocationMap()}
            isEditModeSupported={!isReadonly}
            openDialogProp={onEditButtonClick}
          />
        )}
      </>
      <Container className={css.buttonsWrapper}>
        {isYamlEditable ? (
          <Checkbox
            className={css.editModeCheckbox}
            onChange={e => setYamlAlwaysEditMode(String((e.target as HTMLInputElement).checked))}
            checked={userPreferenceEditMode}
            large
            label={getString('pipeline.alwaysEditModeYAML')}
          />
        ) : (
          <>
            <Tag>{getString('common.readOnly')}</Tag>
            <RbacButton
              permission={{
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                },
                resource: {
                  resourceType: ResourceType.TEMPLATE,
                  resourceIdentifier: templateMetadata.identifier
                },
                permission: PermissionIdentifier.EDIT_TEMPLATE
              }}
              variation={ButtonVariation.SECONDARY}
              text={getString('common.editYaml')}
              onClick={onEditButtonClick}
            />
          </>
        )}
      </Container>
    </div>
  )
}

export default TemplateYamlViewY1
