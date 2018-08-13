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
  ChangeDetectorRef,
  Component,
  DomSanitizer,
  OnDestroy,
  OnInit,
} from 'angular-libs';

import {
  AsyncComponent,
  createOpacityTransition,
  createRouterTransition,
  EvanBCCService,
  EvanCoreService,
  EvanDescriptionService,
  EvanMailboxService,
  EvanRoutingService,
} from 'angular-core';

/**************************************************************************************************/

@Component({
  selector: '<%= dbcpName %>-root',
  templateUrl: 'root.html',
  animations: [
    createOpacityTransition(),
    createRouterTransition([
      // insert router transitions here
    ])
  ]
})

/**
 * Root component for handle routing and navigation.
 *
 * @class      RootComponent (name)
 */
export class RootComponent extends AsyncComponent {
  /**
   * Watch for route changes to update the current router-refs
   */
  private watchRouteChange: Function;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private mailboxService: EvanMailboxService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
  ) {
    super(ref);
  }

  /**
   * Initialize the component and wait for evan.network processes to be finished.
   * 
   * @return     {Promise<void>}  resolved when done
   */
  async _ngOnInit() {
    // initialize DBCP and blockchain-core and provide the default password dialog to unlock current
    // users wallet
    await this.bcc.initialize((accountId) => this.bcc.globalPasswordDialog(accountId));
    
    // Watch for route changes to update the current router-refs
    this.watchRouteChange = this.routingService.subscribeRouteChange(() => this.ref.detectChanges());

    // tell the dapp-browser to hide the initial loading screen
    this.core.finishDAppLoading();
  }

  /**
   * Remove route watchers
   *
   * @return     {Promise<void>}  resolved when done
   */
  async _ngOnDestroy() {
    this.watchRouteChange();
  }
}
