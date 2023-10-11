/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum MessageType {
  Text,
  Prompt
}

export enum MessageRole {
  Assistant,
  User
}

export enum DashboardPromptStage {
  Explore,
  Visualization,
  UserInput,
  Generating
}

// Used for selected prompts that need to map to a keyvalue which can be used by the backend
// (eg: A Looker Explore displayed as "Azure" will have the mapped value "azure")
export interface PromptMapping {
  key: string
  value: string
}

export interface Prompt {
  title?: string
  options: PromptOption[]
}

export interface PromptOption {
  content: string
  mappedContent?: string
  mapping?: PromptMapping[]
}

export interface Message {
  id: string
  type: MessageType
  role: MessageRole
  promptMapping?: PromptMapping[]
  content: string
}

export interface Visualization {
  name: string
  type: VisualizationType
}

export enum VisualizationType {
  BarChart = 'bar_chart',
  ColumnChart = 'column_chart',
  LineChart = 'line_chart',
  PieChart = 'pie_chart',
  Table = 'table',
  ScatterPlot = 'scatterplot',
  SingleValue = 'single_value'
}
