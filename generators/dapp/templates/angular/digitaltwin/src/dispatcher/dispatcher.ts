/*
  Copyright (c) 2018-present evan GmbH.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
      http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
  getDomainName
} from 'dapp-browser';

import {
  Injectable,
  Component, OnInit, Input,            // @angular/core
  Validators, FormBuilder, FormGroup,  // @angular/forms
  DomSanitizer
} from 'angular-libs';

import {
  AngularCore,
  QueueSequence,
  QueueDispatcher,
  SingletonService
} from 'angular-core';

import {
  translations
} from '../i18n/registry';

import {
  <%= cleanName %>Service
} from '../services/service';

/**************************************************************************************************/

export const <%= cleanName %>Dispatcher = new QueueDispatcher(
  [
    new QueueSequence(
      '_<%= cleanName %>.dispatcher.title',
      '_<%= cleanName %>.dispatcher.description',
      async (service: <%= cleanName %>Service, queueEntry: any) => {
        await service.createDigitalTwins(queueEntry.data);
      }
    )
  ],
  translations,
  '<%= cleanName %>Service'
);
