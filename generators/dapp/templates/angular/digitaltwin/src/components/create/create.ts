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
  EvanFileService,
  EvanModalService,
  EvanPictureService,
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
  selector: '<%= cleanName %>-create',
  templateUrl: 'create.html',
  animations: [ ]
})

/**
 * Sample component to display a simple text.
 */
export class CreateComponent extends AsyncComponent {
  /**
   * Function to unsubscribe from queue results.
   */
  private queueWatcher: Function;

  /**
   * data for the data contract that should be created
   */
  private formData: any = <%- digitaltwinFormData %>;

  /**
   * Disable create button while creating a new contract
   */
  private creating: boolean;

  /**
   * contract id for editing
   */
  private contractAddress: string;

  /**
   * Contract ID of the newly created contract
   */
  private newAddress: string;

  /**
   * used to select labelpictures also using the file-select component
   */
  private bannerFileSelect: Array<any> = [ ];

  /**
   * current formular
   */
  @ViewChild('createForm') createForm: any;

  /**
   * input element for selection more items
   */
  @ViewChild('bannerFileSelectComp') bannerFileSelectComp: any;

  constructor(
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private modalService: EvanModalService,
    private pictureService: EvanPictureService,
    private qrCodeService: EvanQrCodeService,
    private queueService: EvanQueue,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private translateService: EvanTranslationService,
    private fileService: EvanFileService,
    private _DomSanitizer: DomSanitizer,
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

    if (this.contractAddress) {
      // load the details
      this.formData = await this.<%= cleanName %>ServiceInstance.loadDigitalTwinData(this.contractAddress);
    } else {
      this.formData.dtGeneral.bannerImg = [{
        blobURI: this._DomSanitizer.bypassSecurityTrustUrl(this.<%= cleanName %>ServiceInstance.defaultBannerImg),
        disableEncryption: true
      }];
    }

    // wait for dispatcher to be finished
    this.queueWatcher = await this.queueService.onQueueFinish(this.<%= cleanName %>ServiceInstance.queueId, async (reload, results) => {
      // if the function was called by finishing the queue, everything is fine.
      if (reload) {
        try {
          await this
            .alertService.showSubmitAlert(
              '_<%= dbcpName %>.favorite-added',
              '_<%= dbcpName %>.favorite-added-desc',
              '_<%= dbcpName %>.ok',
              '',
            );
        } catch (ex) { }

        // sample UI data update
        this.routingService.navigate(`./${ results[0][0] }`);
        this.ref.detectChanges();
      }
    });

    // if anything is in the queue, wait for finishing
    this.creating = this.queueService.getQueueEntry(this.<%= cleanName %>ServiceInstance.queueId, true).data.length > 0;
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
      this.<%= cleanName %>ServiceInstance.queueId,
      {
        contractAddress: this.contractAddress,
        formData: this.formData
      }
    );

    this.ref.detectChanges();

    // if we are editing a contract, navigate back to the detail view
    if (this.contractAddress) {
      this.routingService.goBack();
    }
  }

  /**
   * Checks if a form property is touched and invalid.
   *
   * @param      {string}   paramName  name of the form property that should be checked
   * @return     {boolean}  true if touched and invalid, else false
   */
  showError(paramName: string) {
    if (this.createForm && this.createForm.controls[paramName]) {
      return this.createForm.controls[paramName].invalid &&
        this.createForm.controls[paramName].touched;
    }
  }

  /**
   * Take a snapshot and add it into the given pictures array.
   *
   * @param      {Array<any>}  array           the array, where the img should be added
   * @param      {boolean}      overwriteFirst  only allow one img
   */
  async takeSnapshot(array: Array<any>, overwriteFirst: boolean) {
    try {
      const picture = await this.pictureService.takeSnapshot();

      if (overwriteFirst) {
        array[0] = picture;
      } else {
        array.push(picture);
      }
    } catch (ex) { }

    this.ref.detectChanges();
  }

  /**
   * { function_description }
   *
   * @return     {<type>}  { description_of_the_return_value }
   */
  async chooseBannerImg() {
    this.bannerFileSelectComp.selectFiles();
  }

  /**
   * Transform the file input result for the labelPicture into an single value.
   */
  async bannerFilesChanged() {
    if (this.bannerFileSelect && this.bannerFileSelect.length) {
      const urlCreator = (<any>window).URL || (<any>window).webkitURL;
      const blobURI = urlCreator.createObjectURL(this.bannerFileSelect[0]);
      // transform to array buffer so we can save it within the queue
      const arrayBuffer = await this.fileService.readFilesAsArrayBuffer(
        [ this.bannerFileSelect[0] ]);

      // transform file object
      this.formData.dtGeneral.bannerImg[0] = {
        blobURI: this._DomSanitizer.bypassSecurityTrustUrl(blobURI),
        file: arrayBuffer[0].file,
        fileType: arrayBuffer[0].type,
        name: arrayBuffer[0].name,
      };
    }

    this.ref.detectChanges();
  }

  /**
   * Removes a picture from a pictures array.
   *
   * @param      {Array<any>}  array   array of pictures
   * @param      {number}      index   index that should be removed
   */
  removePicture(array: Array<any>, index: number) {
    array.splice(index, 1);

    this.ref.detectChanges();
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
}
