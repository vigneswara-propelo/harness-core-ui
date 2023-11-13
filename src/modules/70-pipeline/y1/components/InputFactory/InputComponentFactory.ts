/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { InputFactory } from './InputFactory'
import { NumberInput } from './Inputs/NumberInput'
import { TextAreaInput } from './Inputs/TextAreaInput'
import { TextInput } from './Inputs/TextInput'
import { JenkinsJobNameInput } from './Inputs/JenkinsJobNameInput'
import { JenkinsConnectorInput } from './Inputs/JenkinsConnectorInput'
import { BooleanInput } from './Inputs/BooleanInput'
import { EmailInput } from './Inputs/EmailInput'
import { DurationInput } from './Inputs/DurationInput'
import { UrlInput } from './Inputs/UrlInput'
import { HttpMethodInput } from './Inputs/HttpMethodInput'
import { ObjectInput } from './Inputs/ObjectInput'
import { DelegateSelectorInput } from './Inputs/DelegateSelectorInput'
import { ConditionalExecutionInput } from './Inputs/ConditionalExecutionInput'
import { FailureStrategyInput } from './Inputs/FailureStrategyInput/FailureStrategyInput'

const inputComponentFactory = new InputFactory()

inputComponentFactory.registerComponent(new NumberInput())
inputComponentFactory.registerComponent(new TextInput())
inputComponentFactory.registerComponent(new TextAreaInput())
inputComponentFactory.registerComponent(new BooleanInput())
inputComponentFactory.registerComponent(new ObjectInput())
inputComponentFactory.registerComponent(new EmailInput())
inputComponentFactory.registerComponent(new DurationInput())
inputComponentFactory.registerComponent(new UrlInput())
inputComponentFactory.registerComponent(new HttpMethodInput())
inputComponentFactory.registerComponent(new JenkinsJobNameInput())
inputComponentFactory.registerComponent(new JenkinsConnectorInput())
inputComponentFactory.registerComponent(new DelegateSelectorInput())
inputComponentFactory.registerComponent(new ConditionalExecutionInput())
inputComponentFactory.registerComponent(new FailureStrategyInput())

export default inputComponentFactory
