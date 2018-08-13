/*
  Copyright (C) 2018-present evan GmbH.

  This program is free software: you can redistribute it and/or modify it
  under the terms of the GNU Affero General Public License, version 3,
  as published by the Free Software Foundation.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
  See the GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License along with this program.
  If not, see http://www.gnu.org/licenses/ or write to the

  Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA, 02110-1301 USA,

  or download the license from the following URL: https://evan.network/license/

  You can be released from the requirements of the GNU Affero General Public License
  by purchasing a commercial license.
  Buying such a license is mandatory as soon as you use this software or parts of it
  on other blockchains than evan.network.

  For more information, please contact evan GmbH at this address: https://evan.network/license/
*/

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
  <%= dbcpName %>Service
} from '../services/service';

/**************************************************************************************************/

export const <%= dbcpName %>Dispatcher = new QueueDispatcher(
  [
    new QueueSequence(
      '_<%= dbcpName %>.dispatcher.title',
      '_<%= dbcpName %>.dispatcher.description',
      async (service: <%= dbcpName %>Service, queueEntry: any) => {
        for (let entry of queueEntry.data) {
          // get description for the current dapp and use it as contract metadata preset
          const description = await service.descriptionService.getDescription(
            '<%= dbcpName %>.${ getDomainName() }',
            true
          );

          // create the new data contract
          const contract = await service.dataContract.create(
            'testdatacontract',
            service.bcc.core.activeAccount(),
            null,
            { public : description }
          );

          // 
          await service.dataContract.setEntry(entry,
            'metadata',
            entry,
            this.core.activeAccount()
          );
        }
      }
    )
  ],
  translations,
  '<%= dbcpName %>Service'
);
