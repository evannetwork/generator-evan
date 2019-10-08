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
  EvanBCCService,
  EvanBcService,
  EvanCoreService,
  EvanDescriptionService,
  EvanFileService,
  EvanTranslationService,
  EvanUtilService,
  SingletonService,
} from 'angular-core';

/**************************************************************************************************/
/**
 * Utility service for the whole <%= cleanName %> DApp
 */
@Injectable()
export class <%= cleanName %>Service implements OnDestroy {
  /**
   * Create a singleton service instance. 
   */
  constructor(
    public bc: EvanBcService,
    public bcc: EvanBCCService,
    public core: EvanCoreService,
    public descriptionService: EvanDescriptionService,
    public fileService: EvanFileService,
    public singleton: SingletonService,
    public translate: EvanTranslationService,
  ) {
    return singleton.create(<%= cleanName %>Service, this, () => {

    });
  }

  /**
   * Test function to check if service is working.
   */
  public testFunction() {
    console.log('Service is working :)');
  }
}
