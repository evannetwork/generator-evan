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
        const results = [ ];

        const activeAccount = service.core.activeAccount();
        let bcDomain = '<%= bcDomain %>';
        let joinSchema = '<%= joinSchema %>';
        let dataContract = service.bcc.dataContract;

        // if a business center is used, load the business center interface, so we can check which
        // users are within the business center
        if (bcDomain) {
          const [
            businessCenter,
            businessAddress,
          ] = await Promise.all([
            service.bc.getCurrentBusinessCenter(bcDomain),
            service.bcc.nameResolver.getAddress(bcDomain)
          ]);

          let businessCenterContract = await service.bcc.contractLoader.loadContract(
            'BusinessCenter',
            businessAddress
          );
          dataContract = businessCenter.dataContract;

          // check if the current member is within the bc
          const isBCMember = await service.bcc.executor.executeContractCall(
            businessCenterContract,
            'isMember',
            activeAccount,
            { from: activeAccount, }
          );

          if (!isBCMember) {
            // joinOnly or joinOrAdd
            if (joinSchema === '0' || joinSchema === '2') {
              await service.bcc.executor.executeContractTransaction(
                businessCenterContract,
                'join',
                { from: activeAccount, },
              );
            } else {
              throw new Error('You are\'nt a member of the bc and it does not allow self join.');
            }
          }
        }

        for (let entry of queueEntry.data) {
          // get description for the current dapp and use it as contract metadata preset
          const description = await service.descriptionService.getDescription(
            `<%= dbcpName %>.${ getDomainName() }`,
            true
          );
          // apply latest data contract abi for evan explorer usage and documentaion
          description.abis = { own: JSON.parse(service.bcc.contracts.DataContract.interface) };

          const contract = await dataContract.create(
            'testdatacontract.factory.<%= bcDomain %>',
            service.bcc.core.activeAccount(),
            bcDomain,
            { public : description }
          );

          // set datacontract entry
          await dataContract.setEntry(
            contract,
            'entry_settable_by_member',
            entry,
            service.core.activeAccount()
          );

          results.push(contract._address);
        }

        return results;
      }
    )
  ],
  translations,
  '<%= cleanName %>Service'
);
