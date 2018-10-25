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
  EvanPictureService,
  EvanQueue,
  EvanTranslationService,
  EvanUtilService,
  QueueId,
  SingletonService,
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
   * used to format files and pictures into the correct format for saving
   */
  public pictureProps: any = <%- digitaltwinPicProps %>;
  public fileProps: any = <%- digitaltwinFileProps %>;

  /**
   * Create a singleton service instance. 
   */
  constructor(
    public _DomSanitizer: DomSanitizer,
    public bcc: EvanBCCService,
    public core: EvanCoreService,
    public descriptionService: EvanDescriptionService,
    public fileService: EvanFileService,
    public pictureService: EvanPictureService,
    public queueService: EvanQueue,
    public singleton: SingletonService,
    public translate: EvanTranslationService,
  ) {
    return singleton.create(<%= cleanName %>Service, this, () => {
      this.pictureProps.push('bannerImg');

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
      if (this.fileProps.indexOf(key) !== -1 || this.pictureProps.indexOf(key) !== -1) {
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
            formData[key] = await this.fileService.equalizeFileStructure(formData[key]);
          } else {
            formData[key] = parsed;
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
