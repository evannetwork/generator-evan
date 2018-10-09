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
  selector: '<%= cleanName %>-sample',
  templateUrl: 'sample.html',
  animations: [ ]
})

/**
 * Sample component to display a simple text.
 */
export class SampleComponent extends AsyncComponent {
  /**
   * Initialized queueId to simple add data to a queue.
   */
  private queueId: QueueId;

  /**
   * Function to unsubscribe from queue results.
   */
  private queueWatcher: Function;

  /**
   * show data ui update
   */
  private dispatcherIsFinished: boolean;

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
    this.dispatcherIsFinished = false;

    this.<%= cleanName %>ServiceInstance.testFunction();

    // test dispatcher functionallity
    this.queueId = new QueueId(
      `<%= dbcpName %>.${ getDomainName() }`,
      '<%= cleanName %>Dispatcher',
      '<%= cleanName %>'
    );

    // wait for dispatcher to be finished
    this.queueWatcher = await this.queueService.onQueueFinish(this.queueId, async (reload) => {
      // if the function was called by finishing the queue, everything is fine.
      if (reload) {
        console.log('Dispatcher is working');

        // sample UI data update
        this.dispatcherIsFinished = true;
        this.ref.detectChanges();
      }
    });

    // submit new data to the queue
    this.queueService.addQueueData(
      this.queueId,
      {
        param1: 'param1',
        param2: 'param2',
      }
    );

    // start the queue
    this.queueService.startSyncAll();
  }

  /**
   * Clear the queue watcher
   *
   * @return     {<type>}  { description_of_the_return_value }
   */
  async _ngOnDestroy() {
    this.queueWatcher();
  }
}
