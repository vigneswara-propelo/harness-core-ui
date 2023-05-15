import { Button, TableV2 } from '@harness/uicore'
import React, { useState } from 'react'
import { useStrings } from 'framework/strings'
import {
  RenderComparison,
  RenderLevelForQuestion,
  RenderQuestion,
  RenderQuestionsRecommendations
} from '../../AssessmentSurveyTableRows.utils'
import type { Question } from '../../AssessmentSurvey'
import SurveyDrawer from '../SurveyDrawer/SurveyDrawer'
import css from './QuestionsSection.module.scss'

export interface QuestionsSectionProps {
  questions: Question[]
  currentSection: string
}

export default function QuestionsSection(props: QuestionsSectionProps): JSX.Element {
  const { questions, currentSection } = props
  const [currentRowDetails, setCurrentRowDetails] = useState<Question | null>(null)
  const [isOpen, setDrawerOpen] = useState<boolean>(false)
  const { getString } = useStrings()

  const onHideCallback = (): void => setDrawerOpen(false)
  if (questions.length) {
    return (
      <>
        <TableV2
          sortable={true}
          onRowClick={rowDetails => {
            setCurrentRowDetails(rowDetails)
            setDrawerOpen(true)
          }}
          columns={[
            {
              Header: 'CATEGORY',
              id: 'categoryName',
              width: '30%',
              Cell: RenderQuestion
            },

            {
              Header: 'LEVEL',
              width: '10%',
              Cell: RenderLevelForQuestion
            },
            {
              Header: getString('assessments.comparison').toLocaleUpperCase(),
              width: '30%',
              Cell: RenderComparison
            },
            {
              Header: getString('assessments.recommendations').toLocaleUpperCase(),
              width: '30%',
              Cell: RenderQuestionsRecommendations
            }
          ]}
          data={questions}
          className={css.questionSectionTable}
          autoResetExpanded={false}
        />
        <>
          <SurveyDrawer
            isOpen={isOpen}
            onHideCallback={onHideCallback}
            currentSection={currentSection}
            currentRowDetails={currentRowDetails}
          />
          {isOpen ? (
            <Button
              minimal
              className={css.almostFullScreenCloseBtn}
              icon="cross"
              withoutBoxShadow
              onClick={onHideCallback}
            />
          ) : null}
        </>
      </>
    )
  } else {
    return <></>
  }
}
