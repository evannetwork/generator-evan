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
  Component, OnInit, ViewChild,     // @angular/core
  DomSanitizer, ChangeDetectorRef, ChangeDetectionStrategy
} from 'angular-libs';

import {
  EvanCoreService,
  EvanBCCService,
  EvanAlertService,
  EvanQrCodeService,
  AsyncComponent,
  EvanRoutingService
} from 'angular-core';

/**************************************************************************************************/

@Component({
  selector: '<%= dbcpName %>-sample',
  templateUrl: 'sample.html',
  animations: [ ]
})

/**
 * Sample component to display a simple text.
 */
export class SampleComponent extends AsyncComponent {
  constructor(
    private core: EvanCoreService,
    private bcc: EvanBCCService,
    private alertService: EvanAlertService,
    private qrCodeService: EvanQrCodeService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService
  ) {
    super(ref);
  }

  /**
   * Initialize me
   */
  async _ngOnInit() {
  }
}
