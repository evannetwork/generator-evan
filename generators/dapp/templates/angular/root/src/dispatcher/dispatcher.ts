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
        console.log('Dispatcher is starting with the following service:');
        console.dir(<%= cleanName %>Service);

        // save your data here
        for (let entry of queueEntry.data) {
          console.log(`Processing data entry: ${ queueEntry.data.indexOf(entry) }`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.dir(entry);
        }

        console.log('Dispatcher has finished his work.')
      }
    )
  ],
  translations,
  '<%= cleanName %>Service'
);
