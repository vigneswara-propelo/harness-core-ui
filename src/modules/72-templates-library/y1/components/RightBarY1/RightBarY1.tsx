import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
//import { TemplateContextY1 } from '../TemplateContext/TemplateContextY1'
//import { DrawerTypesY1 } from '../TemplateContext/TemplateActionsY1'
import rightBarCss from '@templates-library/components/TemplateStudio/RightBar/RightBar.module.scss'

export function RightBarY1(): JSX.Element {
  const { getString } = useStrings()
  //   const {
  //     state: { templateView },
  //     updatetemplateView
  //   } = React.useContext(TemplateContextY1)

  //const { drawerData } = pipelineView
  //const { type } = drawerData

  const openRuntimeInputsDrawer = (): void => {
    // updateTemplateView({
    //   ...templateView,
    //   isDrawerOpened: true,
    //   drawerData: { type: DrawerTypesY1.RuntimeInputs },
    //   isSplitViewOpen: false,
    //   splitViewData: {}
    // })
  }

  return (
    <aside className={rightBarCss.rightBar}>
      <Button
        className={cx(rightBarCss.iconButton)} //[rightBarCss.selected]: type === DrawerTypesY1.RuntimeInputs
        onClick={openRuntimeInputsDrawer}
        variation={ButtonVariation.TERTIARY}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="pipeline-variables"
        withoutCurrentColor={true}
        iconProps={{ size: 20 }}
        text={getString('pipeline.runtimeInputs')}
        data-testid="runtime-inputs-nav-tile"
      />
      {/* <>{TODO}</> */}
      <></>
    </aside>
  )
}
