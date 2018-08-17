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
  Component, OnInit, ViewChild,     // @angular/core
  DomSanitizer, ChangeDetectorRef, ChangeDetectionStrategy
} from 'angular-libs';

import {
  AsyncComponent,
  EvanAlertService,
  EvanBCCService,
  EvanCoreService,
  EvanDescriptionService,
  EvanQrCodeService,
  EvanQueue,
  EvanRoutingService,
  QueueId,
} from 'angular-core';

import {
  <%= cleanName %>Service
} from '../../services/service';

/**************************************************************************************************/

@Component({
  selector: '<%= cleanName %>-detail',
  templateUrl: 'detail.html',
  animations: [ ]
})

/**
 * Sample component to display a simple text.
 */
export class DetailComponent extends AsyncComponent {
  /**
   * contract id that should be loaded
   */
  private contractAddress: string;

  /**
   * Dbcp Data of the contract
   */
  private dbcpData: any;

  /**
   * Entry data that was inserted by the create component
   */
  private entryData: any;

  constructor(
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private qrCodeService: EvanQrCodeService,
    private queueService: EvanQueue,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private descriptionService: EvanDescriptionService,
    private <%= cleanName %>ServiceInstance: <%= cleanName %>Service
  ) {
    super(ref);
  }

  /**
   * Test if service and dispatcher are working.
   */
  async _ngOnInit() {
    // get current contract address from url
    this.contractAddress = await this.routingService.getHashParam('address');

    // load and stringify the data so we can show it within textareas
    this.dbcpData = JSON.stringify(await this.descriptionService.getDescription(this.contractAddress), null, 2);
    this.entryData = JSON.stringify(await this.bcc.dataContract.getEntry(
      this.contractAddress,
      'entry_settable_by_member',
      this.core.activeAccount()
    ), null, 2);
  }
}
