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
  utils, browserCore, queue, getDomainName
} from 'dapp-browser';

import {
  DomSanitizer,
  Injectable,
  Observable,
  OnDestroy,
  Platform,
  Subscription,
} from 'angular-libs';

import {
  EvanBCCService,
  EvanCoreService,
  EvanDescriptionService,
  EvanFileService,
  EvanTranslationService,
  EvanUtilService,
  QueueId,
  SingletonService,
  EvanQueue,
} from 'angular-core';

/**************************************************************************************************/
/**
 * Utility service for the whole <%= cleanName %> DApp
 */
@Injectable()
export class <%= cleanName %>Service implements OnDestroy {
  /**
   * Initialized queueId to simple add data to a queue.
   */
  public queueId: QueueId;

  /**
   * Create a singleton service instance. 
   */
  constructor(
    public bcc: EvanBCCService,
    public core: EvanCoreService,
    public descriptionService: EvanDescriptionService,
    public fileService: EvanFileService,
    public singleton: SingletonService,
    public translate: EvanTranslationService,
    public queueService: EvanQueue,
    public _DomSanitizer: DomSanitizer,
  ) {
    return singleton.create(<%= cleanName %>Service, this, () => {
      // test dispatcher functionallity
      this.queueId = new QueueId(
        `<%= dbcpName %>.${ getDomainName() }`,
        '<%= cleanName %>Dispatcher',
        '<%= cleanName %>'
      );
    });
  }

  /**
   * Test function to check if service is working.
   */
  public testFunction() {
    console.log('Service is working :)');
  }

  /**
   * Load the details for a digital twin
   *
   * @param      {<type>}  contractAddress  The contract address
   * @return     {<type>}  { description_of_the_return_value }
   */
  public async loadDigitalTwinData(contractAddress: string) {
    const activeAccount = this.core.activeAccount();

    // load the details
    let formData = await this.bcc.dataContract.getEntry(
      contractAddress,
      'entry_settable_by_owner',
      activeAccount
    );

    // search for files and pictures that needs to be decrypted
    for (let key of Object.keys(formData)) {
      if (typeof formData[key] === 'string') {
        try {
          const parsed = JSON.parse(formData[key]);

          if (parsed.private) {
            formData[key] = (await this.bcc.dataContract.decrypt(
              formData[key],
              contractAddress,
              activeAccount,
              '*'
            )).private;

            // transform blobURI to security trust url, so the ui can show it
            if (Array.isArray(formData[key])) {
              const urlCreator = (<any>window).URL || (<any>window).webkitURL;

              for (let entry of formData[key]) {
                if (entry.blobURI) {
                  entry.file = new Blob([entry.file], { type: entry.fileType });
                  entry.blobURI = this._DomSanitizer.bypassSecurityTrustUrl(
                    urlCreator.createObjectURL(entry.file)
                  );
                }
              }
            }
          }
        } catch (ex) { }
      }
    }

    // check if currently anything is saving?
    const queueData = this.queueService.getQueueEntry(this.queueId, true).data;
    if (queueData.length > 0) {
      // overwrite the formData with the queue data
      for (let entry of queueData) {
        if (entry.contractAddress === contractAddress) {
          formData = entry.formData;
        }
      }
    }

    return formData;
  }
}
