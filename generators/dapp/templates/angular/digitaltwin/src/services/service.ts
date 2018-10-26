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
    const formData = { };

    // check if currently anything is saving?
    const queueData = this.queueService.getQueueEntry(this.queueId, true).data;
    if (queueData.length > 0) {
      // overwrite the formData with the queue data
      for (let entry of queueData) {
        if (entry.contractAddress === contractAddress) {
          return entry.formData;
        }
      }
    }

    // load the description to view the dataSchema to know, which dataSets are available
    const description = await this.descriptionService.getDescription(contractAddress, true);
    const dataSetKeys = Object.keys(description.dataSchema);

    // load all defined data schema properties
    await Promise.all(dataSetKeys.map(async (dataSetKey) => {
      // each data set can be shared seperated, so it could be possible, that some users only have
      // access to one data set, all other data sets, that could not be decrypted, will throw
      try {
        formData[dataSetKey] = await this.bcc.dataContract.getEntry(
          contractAddress,
          dataSetKey,
          activeAccount
        );
      } catch (ex) { }
    }));

    // search for files and pictures that needs to be decrypted
    for (let dataSetKey of Object.keys(formData)) {
      const dataSet = formData[dataSetKey];

      for (let key of Object.keys(dataSet)) {
        if (this.fileProps[dataSetKey].indexOf(key) !== -1 ||
            this.pictureProps[dataSetKey].indexOf(key) !== -1) {
          try {
            const parsed = JSON.parse(dataSet[key]);

            if (parsed.private) {
              dataSet[key] = (await this.bcc.dataContract.decrypt(
                dataSet[key],
                contractAddress,
                activeAccount,
                '*'
              )).private;

              // transform blobURI to security trust url, so the ui can show it
              dataSet[key] = await this.fileService.equalizeFileStructure(dataSet[key]);
            } else {
              dataSet[key] = parsed;
            }
          } catch (ex) { }
        }
      }
    }

    return formData;
  }
}
