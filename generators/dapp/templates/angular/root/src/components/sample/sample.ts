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
