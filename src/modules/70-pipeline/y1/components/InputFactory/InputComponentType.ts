/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum PrimitiveInputType {
  number = 'number',
  string = 'string',
  boolean = 'boolean',
  object = 'object',
  text_area = 'text_area',
  email = 'email',
  duration = 'duration',
  url = 'url'
}

export enum DerivedInputType {
  shell_script = 'shell_script',
  jenkins_job_name = 'jenkins_job_name',
  jenkins_connector = 'jenkins_connector',
  http_method = 'http_method',
  delegate_selector = 'delegate_selector',
  conditional_execution = 'conditional_execution',
  failure_strategy = 'failure_strategy'
}

export type InputComponentType = PrimitiveInputType | DerivedInputType
