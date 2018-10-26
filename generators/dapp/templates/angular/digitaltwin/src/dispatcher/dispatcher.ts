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

        for (let entry of queueEntry.data) {
          const formData = entry.formData;
          const contractAddress = entry.contractAddress;

          // get description for the current dapp and use it as contract metadata preset
          const description = await service.descriptionService.getDescription(
            `<%= dbcpName %>.${ getDomainName() }`,
            true
          );

          // all data set keys that should be saved
          const dataSetKeys = Object.keys(description.dataSchema);

          // create the new data contract
          let contract;
          if (contractAddress) {
            contract = service.bcc.contractLoader.loadContract(
              'DataContractInterface',
              contractAddress
            );
          } else {
            contract = await service.bcc.dataContract.create(
              'testdatacontract',
              activeAccount,
              null,
              { public : description }
            );

            // allow all the dbcp dataSchema properties setting
            await Promise.all(dataSetKeys.map(dataSetKey =>
              Promise.all(['set'].map(modificationType =>
                service.bcc.rightsAndRoles.setOperationPermission(
                  contract,
                  activeAccount,
                  0,
                  dataSetKey,
                  service.bcc.web3.utils.sha3('entry'),
                  service.bcc.web3.utils.sha3(modificationType),
                  true,
                )
              ))
            ));
          }

          // load the latest block number, so the encryption will work only for data after this
          // block
          const blockNumber = await service.bcc.web3.eth.getBlockNumber();

          // search for files and pictures that needs to be encrypted !important!: create new
          // metadataToSave object, to keep original queue data reference (it would throw, if we
          // adjust the files for encryption and the original object and it gets persistet into the
          // IndexDB)
          const metadataToSave: any = { };
          for (let dataSetKey of dataSetKeys) {
            const dataSet = metadataToSave[dataSetKey] = { };

            for (let key of Object.keys(formData[dataSetKey])) {
              dataSet[key] = formData[dataSetKey][key];

              // the its a file or a picture, encrypt it!
              if (service.fileProps[dataSetKey].indexOf(key) !== -1 ||
                  service.pictureProps[dataSetKey].indexOf(key) !== -1) {
                // if the encryption should be disabled, continue with the next element
                if (dataSet[key].length === 0 || (dataSet[key].length > 0 &&
                    dataSet[key][0].disableEncryption)) {
                  dataSet[key] = JSON.stringify(dataSet[key]);
                  continue;
                }

                // use the correct format for saving
                dataSet[key] = await service.fileService.equalizeFileStructure(
                  dataSet[key]);

                // encrypt the data
                dataSet[key] = await service.bcc.dataContract.encrypt(
                  {
                    private: dataSet[key]
                  },
                  contract,
                  activeAccount,
                  '*',
                  blockNumber,
                  'aesBlob'
                )
              }
            }
          }

          // set all datacontract data sets
          await Promise.all(dataSetKeys.map(dataSetKey => 
            service.bcc.dataContract.setEntry(
              contract,
              dataSetKey,
              metadataToSave[dataSetKey],
              activeAccount
            )
          ));

          const contentKeys = { };
          const [
            hashKeyToShare,
            sharings,
          ] = await Promise.all([
            // extend sharings only once
            service.bcc.sharing.getHashKey(contract.options.address, activeAccount),
            service.bcc.sharing.getSharingsFromContract(contract),
            Promise.all(dataSetKeys.map(async (dataSetKey) => {
              contentKeys[dataSetKey] = await service.bcc.sharing.getKey(
                contract.options.address,
                activeAccount,
                dataSetKey,
                blockNumber
              );
            }))
          ]);

          // iterate through all members, check if there are within the contract and extend the
          // sharings
          const membersToInvite = [ ];
          for (let dataSetKey of dataSetKeys) {
            for (let member of metadataToSave[dataSetKey].sharedMembers) {
              const isContractMember = await service.bcc.executor.executeContractCall(
                contract,
                'isConsumer',
                member,
                { from: activeAccount, }
              );

              // only invite members once
              if (!isContractMember) {
                membersToInvite.push(member);
              }

              await service.bcc.sharing.extendSharings(
                sharings,
                activeAccount,
                member,
                dataSetKey,
                0,
                contentKeys[dataSetKey],
                null
              );

              // extend the hashKey sharing
              await service.bcc.sharing.extendSharings(
                sharings,
                activeAccount,
                member,
                '*',
                'hashKey',
                hashKeyToShare,
                null
              );
            }
          }

          await service.bcc.sharing.saveSharingsToContract(
            contract.options.address,
            sharings,
            activeAccount
          );

          if (membersToInvite.length > 0) {
            // build bmail for invited user
            const bMailContent = {
              content: {
                from: activeAccount,
                fromAlias: await service.bcc.profile.getProfileKey('alias', activeAccount),
                title: service.translate.instant('_<%= dbcpName %>.contract-invitation.text-title'),
                body: service.translate.instant('_<%= dbcpName %>.contract-invitation.text-body', {
                  contractAddress: contract.options.address,
                }),
                attachments: [{
                  address: contract.options.address,
                  type: 'contract',
                }]
              }
            };

            // invite all members into the contract and send an invitation mail
            await Promise.all(membersToInvite.map(async (member) => {
              return Promise.all([
                service.bcc.dataContract.inviteToContract(
                  null,
                  contract.options.address,
                  activeAccount,
                  member
                ),
                service.bcc.mailbox.sendMail(
                  bMailContent,
                  activeAccount,
                  member
                ),
              ]);
            }));
          }

          // add the bookmark if its not exists before
          if (!contractAddress) {
            description.trimmedName = formData.dtGeneral.type.replace(/\s|\./g, '');
            description.i18n.name = {
              de: formData.dtGeneral.type,
              en: formData.dtGeneral.type,
            };
            await service.bcc.profile.loadForAccount(service.bcc.profile.treeLabels.bookmarkedDapps);
            await service.bcc.profile.addDappBookmark(contract.options.address, description);
            await service.bcc.profile.storeForAccount(service.bcc.profile.treeLabels.bookmarkedDapps);
          }

          results.push(contract._address);
        }

        return results;
      }
    )
  ],
  translations,
  '<%= cleanName %>Service'
);
