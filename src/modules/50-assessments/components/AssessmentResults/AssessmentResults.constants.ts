import type { IDialogProps } from '@blueprintjs/core'

export const GRID_EFFICIENCY_SCORE = {
  CRICLE_SIZE: 150
}

export const DialogProps: IDialogProps = {
  isOpen: false,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: false,
  style: { width: 800, height: 300, borderLeft: 0, paddingBottom: 0, position: 'relative', overflowY: 'scroll' }
}

export const InviteAssessmentModalDialogProps: IDialogProps = {
  ...DialogProps,
  style: { ...DialogProps.style, height: 250, width: 800 }
}

export const mockedResponsesData = {
  assessmentId: 'DEVOPSTest1',
  assessmentName: 'DevOps Test',
  majorVersion: 8,
  minorVersion: 0,
  status: 'COMPLETED',
  userScores: [
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques1', score: 10.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques2', score: 4.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques3', score: 8.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques4', score: 0.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques5', score: 3.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques6', score: 6.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques7', score: 10.0, maxScore: 10 },
    { scoreType: 'SECTION_LEVEL', entityId: 'section_res', score: 41.0, maxScore: 70 },
    { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 41.0, maxScore: 70 }
  ],
  organizationScores: [
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques1', score: 10.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques2', score: 4.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques3', score: 8.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques4', score: 0.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques5', score: 3.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques6', score: 6.0, maxScore: 10 },
    { scoreType: 'QUESTION_LEVEL', entityId: 'ques7', score: 10.0, maxScore: 10 },
    { scoreType: 'SECTION_LEVEL', entityId: 'section_res', score: 41.0, maxScore: 70 },
    { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 41.0, maxScore: 70 }
  ],
  scoreOverview: {
    selfScore: { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 41.0, maxScore: 70 },
    organizationScore: { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 41.0, maxScore: 70 },
    benchmarkScore: { scoreType: 'ASSESSMENT_LEVEL', entityId: 'DEVOPSTest1', score: 57.0, maxScore: 70 },
    numberOfResponses: 1,
    percentageDiffOrg: 0,
    percentageDiffBenchmark: -23,
    benchmarkId: 'top_250_devops',
    benchmarkName: 'top_250_devops',
    best: [
      {
        questionId: 'ques3',
        questionText: 'Do you have Gitop setup?',
        questionType: 'RATING',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'not happy', selected: false },
          { optionId: 'opt2', optionText: 'satisfied', selected: false },
          { optionId: 'opt3', optionText: 'very satisfied', selected: false },
          { optionId: 'opt4', optionText: 'very happy', selected: true },
          { optionId: 'opt5', optionText: 'extremely happy', selected: false }
        ],
        maxScore: 10,
        userScore: 8.0,
        organizationScore: 8.0,
        benchmarkScore: 8.0
      },
      {
        questionId: 'ques1',
        questionText: 'Do you have redundancy for all your microservices and infrastructure?',
        questionType: 'RADIO_BUTTON',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: true },
          { optionId: 'opt2', optionText: 'No', selected: false }
        ],
        maxScore: 10,
        userScore: 10.0,
        organizationScore: 10.0,
        benchmarkScore: 9.0
      },
      {
        questionId: 'ques7',
        questionText: 'Do you have Feature Flags Support',
        questionType: 'RADIO_BUTTON',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: true },
          { optionId: 'opt2', optionText: 'No', selected: false }
        ],
        maxScore: 10,
        userScore: 10.0,
        organizationScore: 10.0,
        benchmarkScore: 8.0
      }
    ],
    worst: [
      {
        questionId: 'ques4',
        questionText: 'Do you have service health monitoring?',
        questionType: 'YES_NO',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Yes', selected: false },
          { optionId: 'opt2', optionText: 'No', selected: true }
        ],
        maxScore: 10,
        userScore: 0.0,
        organizationScore: 0.0,
        benchmarkScore: 8.0
      },
      {
        questionId: 'ques5',
        questionText: 'How Do you rate your CI/CD ?',
        questionType: 'RATING',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: '1', selected: false },
          { optionId: 'opt2', optionText: '2', selected: true },
          { optionId: 'opt3', optionText: '3', selected: false },
          { optionId: 'opt4', optionText: '4', selected: false },
          { optionId: 'opt5', optionText: '5', selected: false }
        ],
        maxScore: 10,
        userScore: 3.0,
        organizationScore: 3.0,
        benchmarkScore: 8.0
      },
      {
        questionId: 'ques2',
        questionText: 'Do you you high Test Coverage?',
        questionType: 'CHECKBOX',
        sectionId: 'section_res',
        sectionText: 'System Resilience',
        responses: [
          { optionId: 'opt1', optionText: 'Its low', selected: false },
          { optionId: 'opt2', optionText: 'Its moderate', selected: false },
          { optionId: 'opt3', optionText: 'Its High', selected: true },
          { optionId: 'opt4', optionText: 'Its excellent', selected: false }
        ],
        maxScore: 10,
        userScore: 4.0,
        organizationScore: 4.0,
        benchmarkScore: 8.0
      }
    ]
  },
  resultLink: 'EOCGaDbVUORuwk2uyX_Evr_J3dw8ddXwEYQuikm9rpw=',
  responses: [
    {
      questionId: 'ques1',
      questionText: 'Do you have redundancy for all your microservices and infrastructure?',
      questionType: 'RADIO_BUTTON',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: true },
        { optionId: 'opt2', optionText: 'No', selected: false }
      ],
      maxScore: 10,
      userScore: 10.0,
      organizationScore: 10.0,
      benchmarkScore: 9.0
    },
    {
      questionId: 'ques2',
      questionText: 'Do you you high Test Coverage?',
      questionType: 'CHECKBOX',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Its low', selected: false },
        { optionId: 'opt2', optionText: 'Its moderate', selected: false },
        { optionId: 'opt3', optionText: 'Its High', selected: true },
        { optionId: 'opt4', optionText: 'Its excellent', selected: false }
      ],
      maxScore: 10,
      userScore: 4.0,
      organizationScore: 4.0,
      benchmarkScore: 8.0
    },
    {
      questionId: 'ques3',
      questionText: 'Do you have Gitop setup?',
      questionType: 'RATING',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'not happy', selected: false },
        { optionId: 'opt2', optionText: 'satisfied', selected: false },
        { optionId: 'opt3', optionText: 'very satisfied', selected: false },
        { optionId: 'opt4', optionText: 'very happy', selected: true },
        { optionId: 'opt5', optionText: 'extremely happy', selected: false }
      ],
      maxScore: 10,
      userScore: 8.0,
      organizationScore: 8.0,
      benchmarkScore: 8.0
    },
    {
      questionId: 'ques4',
      questionText: 'Do you have service health monitoring?',
      questionType: 'YES_NO',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: false },
        { optionId: 'opt2', optionText: 'No', selected: true }
      ],
      maxScore: 10,
      userScore: 0.0,
      organizationScore: 0.0,
      benchmarkScore: 8.0
    },
    {
      questionId: 'ques5',
      questionText: 'How Do you rate your CI/CD ?',
      questionType: 'RATING',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: '1', selected: false },
        { optionId: 'opt2', optionText: '2', selected: true },
        { optionId: 'opt3', optionText: '3', selected: false },
        { optionId: 'opt4', optionText: '4', selected: false },
        { optionId: 'opt5', optionText: '5', selected: false }
      ],
      maxScore: 10,
      userScore: 3.0,
      organizationScore: 3.0,
      benchmarkScore: 8.0
    },
    {
      questionId: 'ques6',
      questionText: 'Do you have Test intelligence',
      questionType: 'RADIO_BUTTON',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: false },
        { optionId: 'opt2', optionText: 'No', selected: true }
      ],
      maxScore: 10,
      userScore: 6.0,
      organizationScore: 6.0,
      benchmarkScore: 8.0
    },
    {
      questionId: 'ques7',
      questionText: 'Do you have Feature Flags Support',
      questionType: 'RADIO_BUTTON',
      sectionId: 'section_res',
      sectionText: 'System Resilience',
      responses: [
        { optionId: 'opt1', optionText: 'Yes', selected: true },
        { optionId: 'opt2', optionText: 'No', selected: false }
      ],
      maxScore: 10,
      userScore: 10.0,
      organizationScore: 10.0,
      benchmarkScore: 8.0
    }
  ]
}
