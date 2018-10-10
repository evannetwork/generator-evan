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
  DomSanitizer, ChangeDetectorRef, ChangeDetectionStrategy,
} from 'angular-libs';

import {
  AsyncComponent,
  EvanAlertService,
  EvanBCCService,
  EvanCoreService,
  EvanDescriptionService,
  EvanModalService,
  EvanQrCodeService,
  EvanQueue,
  EvanRoutingService,
  EvanTranslationService,
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
   * Entry data that was inserted by the create component
   */
  private formData: any;

  /**
   * Is the user permitted to edit the metatada of the twin?
   */
  private canEdit: boolean;

  /**
   * { item_description }
   */
  private saving: boolean;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private modalService: EvanModalService,
    private qrCodeService: EvanQrCodeService,
    private queueService: EvanQueue,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private translateService: EvanTranslationService,
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

    // load the details
    this.formData = await this.<%= cleanName %>ServiceInstance.loadDigitalTwinData(this.contractAddress);

    // load the members and all the roles of the contract and check, if the current logged in user
    // is in the owner role
    const members = await this.bcc.rightsAndRoles.getMembers(this.contractAddress);
    if (members[0] && members[0].indexOf(this.core.activeAccount()) !== -1) {
      this.canEdit = true;
    }

    // check if currently anything is saving?
    this.saving = this.queueService.getQueueEntry(this.<%= cleanName %>ServiceInstance.queueId,
      true).data.length > 0;
  }

  /**
   * Uses an img and shows it within an modal on full screen
   *
   * @param      {string}         dataUrl  url of the img
   */
  async openPictureDetail(dataUrl) {
    try {
      await this.modalService.showBigPicture(
        'alertTitle',
        'alertText',
        dataUrl,
      );
    } catch (ex) { }
  }

  /**
   * Opens the edit page for the contract.
   */
  openEdit() {
    this.routingService.navigate('./edit-contract');
  }
}
