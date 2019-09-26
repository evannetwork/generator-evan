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
        return await service.createDigitalTwins(queueEntry.data);
      }
    )
  ],
  translations,
  '<%= cleanName %>Service'
);
