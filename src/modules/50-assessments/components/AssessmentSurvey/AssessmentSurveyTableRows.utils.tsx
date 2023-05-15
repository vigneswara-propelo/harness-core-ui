import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { CellProps, Renderer, UseExpandedRowProps } from 'react-table'
import Highcharts from 'highcharts'
import { Color } from '@harness/design-system'
import HighchartsReact from 'highcharts-react-official'
import { killEvent } from '@common/utils/eventUtils'

import { getScoreComparisonChartOptions, getWeightageChartOptions } from '../AssessmentResults/AssessmentResults.utils'
import { SURVEY_CHART_OPTIONS } from './AssessmentSurvey.constants'
import Score from './components/Score/Score'
import thumpsUpImage from '../../assets/Thumpsup.svg'
import L3Image from '../../assets/L3.svg'
import L2Image from '../../assets/L2.svg'
import L1Image from '../../assets/L1.svg'
import PlanningAndRequirementsProcessImage from '../../assets/PlanningAndRequirementsProcess.svg'
import DiscoverabilityAndDocumentationImage from '../../assets/DiscoverabilityAndDocumentation.svg'
import DeveloperEnvironmentExperienceImage from '../../assets/DeveloperEnvironmentExperience.svg'
import type { Question, SectionsGroupedQuestions } from './AssessmentSurvey'
import css from './AssessmentSurvey.module.scss'

export const RenderCategory: Renderer<CellProps<SectionsGroupedQuestions>> = ({ row }) => {
  const sectionName = row?.original?.sectionName
  const sectionImage = getSectionImage(sectionName)
  return (
    <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }}>
      <img src={sectionImage} width="30" height="30" alt="" />
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_600}>
        {sectionName}
      </Text>
    </Layout.Horizontal>
  )
}

export const RenderLevelForSection: Renderer<CellProps<SectionsGroupedQuestions>> = ({ row }) => {
  const renderLevel = row?.original?.level
  let renderLevelImage = L3Image
  switch (renderLevel) {
    case 'Level 3':
      renderLevelImage = L3Image
      break
    case 'Level 2':
      renderLevelImage = L2Image
      break
    case 'Level 1':
      renderLevelImage = L1Image
      break
    default:
      renderLevelImage = L3Image
  }
  return (
    <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }}>
      <img src={renderLevelImage} width="42" height="42" alt="" />
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
        {`${renderLevel}`}
      </Text>
    </Layout.Horizontal>
  )
}

export const RenderWeightage: Renderer<CellProps<SectionsGroupedQuestions>> = ({ row }) => {
  const renderWeightage = row?.original?.weightage
  return <HighchartsReact highcharts={Highcharts} options={getWeightageChartOptions(renderWeightage)} />
}

export const RenderScore: Renderer<CellProps<SectionsGroupedQuestions>> = ({ row }) => {
  const userScoreInfo = row?.original?.userScore as number
  return <Score userScore={userScoreInfo} />
}

export const RenderComparison: Renderer<CellProps<SectionsGroupedQuestions>> = ({ row }) => {
  const data = row?.original
  const { benchmarkScore: questionBenchMarkScore, organizationScore: questionOrgScore, userScore } = data

  return (
    <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }}>
      <Layout.Vertical padding={{ top: 'small' }} width={120}>
        <Text className={css.scoreLabels}>{'Your score'}</Text>
        <Text className={css.scoreLabels}>{'Company score'}</Text>
        {questionBenchMarkScore ? <Text className={css.scoreLabels}>{'Benchmark'}</Text> : null}
      </Layout.Vertical>
      <Container flex={{ justifyContent: 'center', alignItems: 'center' }}>
        <HighchartsReact
          highcharts={Highcharts}
          options={getScoreComparisonChartOptions(
            { userScore, questionOrgScore, questionBenchMarkScore },
            SURVEY_CHART_OPTIONS
          )}
        />
      </Container>
    </Layout.Horizontal>
  )
}

export const RenderRecommendations: Renderer<CellProps<SectionsGroupedQuestions>> = ({ row }) => {
  const recommendationsCount = row?.original?.recommendations
  if (recommendationsCount && recommendationsCount > 0) {
    return (
      <Container
        flex={{ justifyContent: 'center', alignItems: 'center' }}
        background={Color.PRIMARY_1}
        className={css.recommendationContainer}
        margin={{ left: 'small' }}
      >
        <Text
          font={{ weight: 'semi-bold', size: 'normal' }}
          color={Color.PRIMARY_7}
          padding={{ left: 'xsmall' }}
        >{`${recommendationsCount} Recommendations`}</Text>
      </Container>
    )
  } else {
    return (
      <Layout.Horizontal padding={{ left: 'medium' }}>
        <img src={thumpsUpImage} width="24" height="24" alt="" />
        <Text padding={{ left: 'small' }}>{'You are at the highest level in this category'}</Text>
      </Layout.Horizontal>
    )
  }
}

export const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<SectionsGroupedQuestions> }> = ({ row }) => {
  return (
    <Layout.Horizontal onClick={killEvent}>
      <Button
        {...row.getToggleRowExpandedProps()}
        color={Color.GREY_600}
        icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
        variation={ButtonVariation.ICON}
        iconProps={{ size: 19 }}
        className={css.toggleAccordion}
      />
    </Layout.Horizontal>
  )
}

export const RenderQuestion: Renderer<CellProps<Question>> = ({ row }) => {
  const { questionName, capability } = row?.original || {}

  return (
    <Layout.Vertical padding={{ left: 'small', right: 'medium' }}>
      <Text padding={{ top: 'small' }} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
        {capability}
      </Text>
      <Text padding={{ top: 'small', bottom: 'small' }} font={{ size: 'normal' }} color={Color.GREY_500}>
        {questionName}
      </Text>
    </Layout.Vertical>
  )
}

export const RenderQuestionsRecommendations: Renderer<CellProps<Question>> = ({ row }) => {
  const recommendations = row?.original?.recommendations

  if (recommendations) {
    return (
      <Container flex={{ justifyContent: 'center', alignItems: 'center' }}>
        <Text padding={{ left: 'small' }}>{recommendations}</Text>
      </Container>
    )
  } else {
    return (
      <Layout.Horizontal padding={{ left: 'medium' }}>
        <img src={thumpsUpImage} width="24" height="24" alt="" />
        <Text padding={{ left: 'small' }}>{'You are doing well'}</Text>
      </Layout.Horizontal>
    )
  }
}

export const RenderLevelForQuestion: Renderer<CellProps<Question>> = ({ row }) => {
  const renderLevel = row?.original?.level
  return (
    <Container>
      <Text padding={'medium'} font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_900}>
        {renderLevel}
      </Text>
    </Container>
  )
}

export function getSectionImage(sectionName: string): string {
  let sectionImage = PlanningAndRequirementsProcessImage
  switch (sectionName) {
    case 'Planning and Requirements Process':
      sectionImage = PlanningAndRequirementsProcessImage
      break
    case 'Discoverability and Documentation':
      sectionImage = DiscoverabilityAndDocumentationImage
      break
    case 'Developer Environment Experience':
      sectionImage = DeveloperEnvironmentExperienceImage
      break
    default:
      sectionImage = PlanningAndRequirementsProcessImage
  }
  return sectionImage
}
