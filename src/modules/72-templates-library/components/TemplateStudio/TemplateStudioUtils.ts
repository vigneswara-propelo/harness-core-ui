/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import type { StringKeys } from 'framework/strings'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { DefaultNewTemplateId } from 'framework/Templates/templates'

export function getContentAndTitleStringKeys(isYamlError: boolean): {
  navigationContentText: StringKeys
  navigationTitleText: StringKeys
} {
  return {
    navigationContentText: isYamlError ? 'navigationYamlError' : 'navigationCheckText',
    navigationTitleText: isYamlError ? 'navigationYamlErrorTitle' : 'navigationCheckTitle'
  }
}

export function isValidYaml<T = NGTemplateInfoConfig>(
  yamlHandler: YamlBuilderHandlerBinding | undefined,
  showInvalidYamlError: (error: string) => void,
  getString: (key: StringKeys, vars?: Record<string, any>) => string,
  updateTemplate: (template: T) => Promise<void>
): boolean {
  // istanbul ignore else
  if (yamlHandler) {
    try {
      const parsedYaml = parse(yamlHandler.getLatestYaml())
      // istanbul ignore else
      if (!parsedYaml || yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
        showInvalidYamlError(getString('invalidYamlText'))
        return false
      }
      updateTemplate(parsedYaml.template)
    } catch (e) {
      showInvalidYamlError(defaultTo(e.message, getString('invalidYamlText')))
      return false
    }
  }
  // istanbul ignore next - This is required just to match the return type and nothing more
  return true
}

export const isPipelineOrStageType = (type: TemplateType) => {
  return type === TemplateType.Pipeline || type === TemplateType.Stage
}

export const isNewTemplate = (templateIdentifier: string | undefined): boolean | undefined => {
  return templateIdentifier === DefaultNewTemplateId
}

export enum TemplateTypes {
  Step = 'step',
  Stage = 'stage',
  Pipeline = 'pipeline',
  CustomDeployment = 'customdeployment',
  MonitoredService = 'monitoredservice',
  SecretManager = 'secretmanager',
  ArtifactSource = 'artifactsourcetemplate',
  StepGroup = 'stepgroup'
}

export enum TemplateTypesY1 {
  step = 'step',
  stage = 'stage',
  pipeline = 'pipeline',
  custom_deployment = 'customdeployment',
  monitored_service = 'monitoredservice',
  secret_manager = 'secretmanager',
  artifact_source = 'artifactsourcetemplate',
  stepgroup = 'stepgroup'
}

export const TemplateTypesUIToY1Map: Record<string, string> = {
  Step: 'step',
  Stage: 'stage',
  Pipeline: 'pipeline',
  CustomDeployment: 'custom_deployment',
  MonitoredService: 'monitored_service',
  SecretManager: 'secret_manager',
  ArtifactSource: 'artifact_source_template',
  StepGroup: 'group'
}
