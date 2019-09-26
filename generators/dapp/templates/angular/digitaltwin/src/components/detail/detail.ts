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
   * Function to unsubscribe from queue results.
   */
  private queueWatcher: Function;

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
   * is currently something in save process?
   */
  private saving: boolean;

  /**
   * hide / show content of data set
   */
  private hiddenDataSets: any = { };

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
    this.contractAddress = this.routingService.getContractAddress();

    this.queueWatcher = await this.queueService.onQueueFinish(this.<%= cleanName %>ServiceInstance.queueId,
      async (reload, results) => {
        if (reload) {
          await this.core.utils.timeout(0);
        }

        // load the details
        this.formData = await this.<%= cleanName %>ServiceInstance.loadDigitalTwinData(this.contractAddress);

        // check if currently anything is saving?
        this.saving = this.queueService.getQueueEntry(this.<%= cleanName %>ServiceInstance.queueId,
          true).data.length > 0;

        // load the members and all the roles of the contract and check, if the current logged in user
        // is in the owner role
        const members = await this.bcc.rightsAndRoles.getMembers(this.contractAddress);
        if (members[0] && members[0].indexOf(this.core.activeAccount()) !== -1) {
          this.canEdit = true;
        }

        if (reload) {
          this.ref.detectChanges();
        }
      }
    );
  }

  /**
   * Clear the queue watcher
   */
  async _ngOnDestroy() {
    this.queueWatcher();
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

  /**
   * Invite only the members of the given data set
   *
   * @param      {string}  dataSetKey  data set to invite new members to.
   */
  inviteNewMembers(dataSetKey: string) {
    // save only the specific data set
    const formDataToSave = { };
    formDataToSave[dataSetKey] = this.formData[dataSetKey];

    // submit new data to the queue
    this.queueService.addQueueData(
      this.<%= cleanName %>ServiceInstance.queueId,
      {
        contractAddress: this.contractAddress,
        formData: formDataToSave
      }
    );

    this.saving = true;
    this.ref.detectChanges();
  }
}
