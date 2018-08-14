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
  utils, browserCore, queue
} from 'dapp-browser';

import {
  Injectable,
  Observable,
  OnDestroy,
  Platform,
  Subscription
} from 'angular-libs';

import {
  EvanUtilService,
  SingletonService,
  EvanBCCService,
  EvanDescriptionService,
  EvanCoreService
} from 'angular-core';

/**************************************************************************************************/
/**
 * Utility service for the whole angular core module
 *
 * @class      Injectable EvanUtilService
 */
@Injectable()
export class <%= dbcpName %>Service implements OnDestroy {
  /**
   * Create a singleton service instance. 
   */
  constructor(
    public bcc: EvanBCCService,
    public core: EvanCoreService,
    public descriptionService: EvanDescriptionService,
    public singleton: SingletonService,
  ) {
    return singleton.create(<%= dbcpName %>Service, this, () => {

    });
  }

  /**
   * Test function to check if service is working.
   */
  public testFunction() {
    console.log('Service is working :)');
  }
}
