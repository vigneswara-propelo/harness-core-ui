/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Tabs, Tab, Text, HarnessDocTooltip } from '@harness/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'

import { ScheduleTabs, getDefaultExpressionBreakdownValues, scheduleTabsId } from './components/utils'

import MinutesTab from './components/MinutesTab/MinutesTab'
import HourlyTab from './components/HourlyTab/HourlyTab'
import DailyTab from './components/DailyTab/DailyTab'
import WeeklyTab from './components/WeeklyTab/WeeklyTab'
import MonthlyTab from './components/MonthlyTab/MonthlyTab'
import YearlyTab from './components/YearlyTab/YearlyTab'
import CustomTab from './components/CustomTab/CustomTab'

import css from './SchedulePanel.module.scss'

export interface SchedulePanelPropsInterface {
  formikProps?: any
  /**
   * Renders only the custom tab in panel
   */
  isEdit?: boolean
  /**
   * Render the form Title above tabs panel container
   */
  renderFormTitle?: boolean
  hideSeconds: boolean
  isQuartsExpressionSupported: boolean
}

const FormTitle: React.FC = () => {
  const { getString } = useStrings()
  const currentDate = new Date()

  return (
    <Text className={css.formContentTitle} inline={true}>
      {getString('common.schedule')}
      <HarnessDocTooltip tooltipId="schedulePanel" useStandAlone={true} />
      <Layout.Horizontal flex>
        <Text>
          {getString('common.schedulePanel.currentUTCTime')} {currentDate.getUTCHours()}:
          {String(currentDate.getUTCMinutes()).padStart(2, '0')}
        </Text>
        <Text>
          {getString('common.schedulePanel.currentTime')}
          {currentDate.getHours()}:{String(currentDate.getMinutes()).padStart(2, '0')}
        </Text>
      </Layout.Horizontal>
    </Text>
  )
}

const SchedulePanel: React.FC<SchedulePanelPropsInterface> = ({
  formikProps: {
    values: { selectedScheduleTab },
    values
  },
  formikProps,
  isEdit = false,
  renderFormTitle = true,
  hideSeconds,
  isQuartsExpressionSupported
}): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Vertical
      className={cx(css.schedulePanelContainer, { [css.schedulePanelContainerPadding]: renderFormTitle })}
      spacing="large"
    >
      {renderFormTitle && <FormTitle />}
      <Layout.Vertical className={css.formContent}>
        <Tabs
          id="Wizard"
          onChange={(val: ScheduleTabs) => {
            const newDefaultValues = selectedScheduleTab !== val ? getDefaultExpressionBreakdownValues(val) : {}
            formikProps.setValues({ ...values, ...newDefaultValues, selectedScheduleTab: val })
          }}
          defaultSelectedTabId={selectedScheduleTab}
        >
          {!isEdit && (
            <Tab
              id={scheduleTabsId.MINUTES}
              title={getString('common.schedulePanel.minutesLabel')}
              panel={<MinutesTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.HOURLY}
              title={getString('common.schedulePanel.hourlyTabTitle')}
              panel={<HourlyTab formikProps={formikProps} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.DAILY}
              title={getString('common.schedulePanel.dailyTabTitle')}
              panel={<DailyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.WEEKLY}
              title={getString('common.schedulePanel.weeklyTabTitle')}
              panel={<WeeklyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.MONTHLY}
              title={getString('common.schedulePanel.monthlyTabTitle')}
              panel={<MonthlyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          {!isEdit && (
            <Tab
              id={scheduleTabsId.YEARLY}
              title={getString('common.schedulePanel.yearlyTabTitle')}
              panel={<YearlyTab formikProps={formikProps} hideSeconds={hideSeconds} />}
            />
          )}
          <Tab
            id={scheduleTabsId.CUSTOM}
            title={getString('common.repo_provider.customLabel')}
            panel={<CustomTab formikProps={formikProps} isQuartsExpressionSupported={isQuartsExpressionSupported} />}
          />
        </Tabs>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}
export default SchedulePanel
