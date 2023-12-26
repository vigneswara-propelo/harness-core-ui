import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { GetTemplateQueryParams } from 'services/template-ng'
import { YamlVersion } from '@pipeline/common/hooks/useYamlVersion'
import { DefaultNewTemplateId, DefaultNewVersionLabel } from 'framework/Templates/templates'
import type {
  NGTemplateInfoConfigY1_Tmp,
  TemplateMetadata_Tmp
} from '@modules/72-templates-library/y1/components/TemplateContext/types'
import { getTemplateMetadata } from './helpers'

const DEFAULT_YAML_VERSION = '0'

export const DefaultTemplateY1: NGTemplateInfoConfigY1_Tmp = {
  version: 1,
  kind: 'template',
  spec: {
    type: ''
  }
}

export const DefaultTemplateMetadataY1: TemplateMetadata_Tmp = {
  name: '',
  identifier: DefaultNewTemplateId,
  versionLabel: DefaultNewVersionLabel
}

export const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  templateIdentifier: string,
  versionLabel: string,
  repoIdentifier = /* istanbul ignore next */ '',
  branch = /* istanbul ignore next */ ''
): string =>
  `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${templateIdentifier}_${encodeURIComponent(
    versionLabel
  )}_${repoIdentifier}_${branch}`

export interface GetYamlVersionArgs {
  queryParams: GetTemplateQueryParams
  templateIdentifier: string
  signal?: AbortSignal
}

export async function getYamlVersion(args: GetYamlVersionArgs): Promise<YamlVersion> {
  const { queryParams, templateIdentifier, signal } = args
  const { branch, repoName } = queryParams

  const response = await getTemplateMetadata(
    {
      ...queryParams,
      templateListType: TemplateListType.All,
      size: 100,
      ...(repoName && branch ? { repoName, branch } : {})
    },
    templateIdentifier,
    signal
  )

  return (response[0].yamlVersion as YamlVersion) ?? DEFAULT_YAML_VERSION
}
