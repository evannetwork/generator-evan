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
  getDomainName,
  solc,
  System,
} from 'dapp-browser';

import {
  Parser 
} from 'csv-parse';

import {
  Ipld,
  prottle
} from 'bcc';

import {
  Component, OnInit, ViewChild,     // @angular/core
  DomSanitizer, ChangeDetectorRef, ChangeDetectionStrategy,
  Http, Response, RequestOptions, Headers       // @angular/http
} from 'angular-libs';

import {
  AsyncComponent,
  createOpacityTransition,
  createTabSlideTransition,
  EvanAlertService,
  EvanBCCService,
  EvanCoreService,
  EvanDescriptionService,
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
  selector: '<%= cleanName %>-csv-import',
  templateUrl: 'csv-import.html',
  animations: [
    createOpacityTransition(),
    createTabSlideTransition()
  ]
})

/**
 * Component to import digital twins.
 */
export class CSVImportComponent extends AsyncComponent {
  /**
   * current csv file
   */
  private csv: any;

  /**
    * holds all lines for a given CSV
    */
  private lines: any = [ ];

  /**
   * holds maximum 10 lines, so the frontend will not die, when a lot of data is imported
   */
  private linesToDisplay: Array<any> = [ ];

  /**
   * limit of lines to display
   */
  private displayLimit: number = 10;

  /**
   * current index of line that should be imported
   */
  private lowestDisplayIndex: number = 0;

  /**
    * frontend check for importing
    */
  private importing: boolean = false;

  /**
    * frontend check for done importing
    */
  private importingDone: boolean = false;

  /**
   * current selected files
   */
  private files: Array<any> = [ ];

  /**
   * dbcp description of the current dapp
   */
  private description: any;

  /**
   * dataSchema of the dapp to get dataSchema from
   */
  private dataSchema: any;

  /**
   * all available csv columns 
   */
  private columns: Array<string>;

  constructor(
    private <%= cleanName %>ServiceInstance: <%= cleanName %>Service,
    private alertService: EvanAlertService,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private http: Http,
    private qrCodeService: EvanQrCodeService,
    private queueService: EvanQueue,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
    private translateService: EvanTranslationService,
  ) {
    super(ref);
  }

  async _ngOnInit() {
    this.description = (await this.descriptionService.getDescription(
      `<%= dbcpName %>.${ getDomainName() }`, true));
    this.dataSchema = this.description.dataSchema;
    this.columns = await this.getColumns();
  }

  /**
   * Reads the text from a file.
   *
   * @param      {file}    file     The file object loaded by an file input.
   * @return     {string}  text content of file
   */
  async readAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsText(file);
    });
  }

  /**
   * Handle file input file change.
   *
   * @param      {Array<any>}  files   selected files
   */
  async handleFileInput(files: Array<any>) {
    if (files.length > 0) {
      this.csv = files[0];

      // When we are done, test that the parsed output matched what expected
      this.lines = await this.parseCSV();
      this.linesToDisplay = this.lines.slice(0, this.displayLimit);

      this.ref.detectChanges();
    }
  }

  /**
   * Build all columns that can be imported.
   *
   * @return     {Array<string>}  All columns using the following format dataset.key.
   */
  async getColumns() {
    const columns = [ ];
    const dataSetKeys = Object.keys(this.dataSchema);

    dataSetKeys.forEach(key => 
      Object.keys(this.dataSchema[key].properties).forEach((prop) => {
        if (this.<%= cleanName %>ServiceInstance.pictureProps[key].indexOf(prop) === -1 &&
            this.<%= cleanName %>ServiceInstance.fileProps[key].indexOf(prop) === -1) {
          columns.push(`${ key }.${ prop }`)
        }
      })
    );

    return columns;
  }

  /**
   * Parse the current selected csv file and apply each line to the lines array.
   *
   * @return     {Promise<void>}  resolved when done
   */
  async parseCSV() {
    const lines = [ ];

    return new Promise(async (resolve) => {
      const csvText = await this.readAsText(this.csv);

      const parser:any = new Parser({
        columns: await this.getColumns(),
        from: 2,
        delimiter: ';'
      });
      // Write data to the stream
      parser.write(csvText)
      // Close the readable stream
      parser.end()
      // Use the readable stream api
      parser.on('readable', () => {
        let record;

        while (record = parser.read()) {
          lines.push(record)
        }
      });
      // Catch any error
      parser.on('error', (err) => {
        console.error(err.message)
        try {
          this.alertService.showSubmitAlert(
            '_<%= dbcpName %>.invalid-csv',
            '_<%= dbcpName %>.invalid-csv-desc',
            'ok',
          );
        } catch (ex) { }

        this.importing = false;
        this.ref.detectChanges();
      });

      // When we are done, test that the parsed output matched what expected
      parser.on('end', async () => resolve(lines));
    });
  }

  /**
   * Handle the current csv file and try to parse all the data entries from it.
   *
   * @return     {Promise<void>}  resolved when done
   */
  async importTwins() {
    const activeAccount = this.core.activeAccount();
    const dataContract = (await this.<%= cleanName %>ServiceInstance.bc
      .getCurrentBusinessCenter('<%= bcDomain %>')).dataContract;

    this.importing = true;
    this.ref.detectChanges();

    // When we are done, test that the parsed output matched what expected
    this.lines = await this.parseCSV();

    await this.<%= cleanName %>ServiceInstance.joinBCMember(activeAccount);

    for (let i = 0; i < this.lines.length; i++) {
      if (this.lines.length > this.displayLimit && i > 5) {
        this.linesToDisplay = this.lines.slice(i - 5, i + this.displayLimit);
        this.lowestDisplayIndex = i - 5;
      } else {
        this.lowestDisplayIndex = 0;
        this.linesToDisplay = this.lines.slice(0, this.displayLimit);
      }

      const line = this.lines[i];
      const metadata = {
        dtGeneral: {
          bannerImg: '???' //TODO: add banner img stuff
        }
      };

      for (let key of Object.keys(line)) {
        const split = key.split('.');

        metadata[split[0]] = metadata[split[0]] || { };

        if (split[1] === 'sharedMembers') {
          metadata[split[0]][split[1]] = line[key].replace(/\'|\"/g, '').split(',');
        } else {
          metadata[split[0]][split[1]] = line[key];
        }
      }

      for (let dataSetKey of Object.keys(this.dataSchema)) {
        for (let prop of Object.keys(this.dataSchema[dataSetKey])) {
          metadata[dataSetKey] = metadata[dataSetKey] || { };
          metadata[dataSetKey][prop] = metadata[dataSetKey][prop] || '';
        }
      }

      line.loading = true;
      this.ref.detectChanges();

      const contract = await this.<%= cleanName %>ServiceInstance.createDtContract(dataContract,
        this.description);
      // set all datacontract data sets
      await Promise.all(Object.keys(metadata).map(dataSetKey => 
        this.bcc.dataContract.setEntry(
          contract,
          dataSetKey,
          metadata[dataSetKey],
          activeAccount
        )
      ));

      line.contractAddress = contract.options.address;
      line.loading = false;
      this.ref.detectChanges();
    }
   
    this.importing = false;
    this.importingDone = true;
    this.ref.detectChanges();
  }

  /**
   * Download the digital twin template.
   *
   * @return     {Promise<void}  { description_of_the_return_value }
   */
  async downloadTemplate() {
    const content = [
      this.columns.join(','), 
      this.columns.map((value, index) => {
        const split = value.split('.');

        if (split[1] === 'sharedMembers') {
          return `"0x000...,0x0001..."`;
        } else {
          return `Test value ${ index }`;
        }
      }).join(';'),
    ].join('\n');

    let blob = new Blob([content],{type: 'text/csv;charset=utf-8;'});
    window.open(URL.createObjectURL(blob), '_blank');
  }

  /**
   * Download the digital twin template.
   *
   * @return     {Promise<void}  { description_of_the_return_value }
   */
  async downloadStatusCSV() {
    const content = [
      ['Status'].concat(this.columns).join(','),
    ].concat(
      this.lines.map((line) => {
        let result = [ ];

        if (line.loading) {
          result.push('loading...');
        } else if (line.contractAddress) {
          result.push(line.contractAddress);
        } else {
          result.push('waiting...');
        }

        result = result.concat(this.columns.map(column => line[column]));

        return result.join(';');
      })
    ).join('\n');

    let blob = new Blob([content],{type: 'text/csv;charset=utf-8;'});
    window.open(URL.createObjectURL(blob), '_blank');
  }
}
