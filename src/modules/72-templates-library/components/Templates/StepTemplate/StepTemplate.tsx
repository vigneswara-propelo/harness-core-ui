import React from 'react'
import { Color } from '@wings-software/uicore'
import { Template, TemplateProps } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { NGTemplateInfoConfig } from 'services/template-ng'
import { StepTemplateCanvasWithRef } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateCanvas'

export class StepTemplate extends Template<NGTemplateInfoConfig> {
  protected type = TemplateType.Step
  protected name = 'Step Template'
  protected color = Color.PURPLE_700

  protected defaultValues: NGTemplateInfoConfig = {
    name: 'Template name',
    identifier: 'Template_name',
    versionLabel: '',
    type: 'Step'
  }

  renderTemplateCanvas(props: TemplateProps<NGTemplateInfoConfig>): JSX.Element {
    const { formikRef } = props
    return <StepTemplateCanvasWithRef ref={formikRef} />
  }
}
