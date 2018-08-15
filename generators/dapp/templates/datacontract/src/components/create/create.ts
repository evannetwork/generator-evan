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
  selector: '<%= cleanName %>-create',
  templateUrl: 'create.html',
  animations: [ ]
})

/**
 * Sample component to display a simple text.
 */
export class CreateComponent extends AsyncComponent {
  /**
   * Initialized queueId to simple add data to a queue.
   */
  private queueId: QueueId;

  /**
   * Function to unsubscribe from queue results.
   */
  private queueWatcher: Function;

  /**
   * data for the data contract that should be created
   */
  private formData: any;

  /**
   * Disable create button while creating a new contract
   */
  private creating: boolean;

  /**
   * Contract ID of the newly created contract
   */
  private contractAddress: string;

  constructor(
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private qrCodeService: EvanQrCodeService,
    private queueService: EvanQueue,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private <%= cleanName %>ServiceInstance: <%= cleanName %>Service
  ) {
    super(ref);
  }

  /**
   * Test if service and dispatcher are working.
   */
  async _ngOnInit() {
    this.formData = { };

    // test dispatcher functionallity
    this.queueId = new QueueId(
      `<%= dbcpName %>.${ getDomainName() }`,
      '<%= cleanName %>Dispatcher',
      '<%= cleanName %>'
    );

    // wait for dispatcher to be finished
    this.queueWatcher = await this.queueService.onQueueFinish(this.queueId, async (reload, results) => {
      // if the function was called by finishing the queue, everything is fine.
      if (reload) {
        console.log('Dispatcher is working');

        // sample UI data update
        this.contractAddress = results[0][0];
        this.creating = false;
        this.ref.detectChanges();
      }
    });
  }

  /**
   * Clear the queue watcher
   */
  async _ngOnDestroy() {
    this.queueWatcher();
  }
  
  /**
   * Starts the creation of a new contract
   */
  create() {
    this.creating = true;

    // submit new data to the queue
    this.queueService.addQueueData(
      this.queueId,
      this.formData
    );

    this.ref.detectChanges();
  }
}
