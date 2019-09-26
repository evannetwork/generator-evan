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
  private displayLimit: number = 20;

  /**
   * current index of line that should be imported
   */
  private currIndexingStart: number = 0;

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

  /**
   * only run one file input change, could trigger multiple times
   */
  private handlingFileInput: boolean;

  /**
   * stopp import, when leaving the ui!
   */
  private stopped: boolean;

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

  async _ngOnDestroy() {
    this.stopped = true;
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
    if (this.handlingFileInput) {
      return;
    }

    this.handlingFileInput = true;
    if (files.length > 0) {
      this.csv = files[0];

      // When we are done, test that the parsed output matched what expected
      this.lines = await this.parseCSV();
      this.linesToDisplay = this.lines.slice(0, this.displayLimit);

      // clear the files list, so uploading the same file will also trigger the file change event
      files.splice(0, 1);

      this.ref.detectChanges();
    }

    this.handlingFileInput = false;
  }

  /**
   * Build all columns that can be imported.
   *
   * @return     {Array<string>}  All columns using the following format dataset.key.
   */
  async getColumns() {
    const columns = [ 'contractAddress', 'error' ];
    const dataSetKeys = Object.keys(this.dataSchema);

    dataSetKeys.forEach(key => 
      Object.keys(this.dataSchema[key].properties).forEach((prop) => {
        if (this.<%= cleanName %>ServiceInstance.pictureProps[key].indexOf(prop) === -1 &&
            this.<%= cleanName %>ServiceInstance.fileProps[key].indexOf(prop) === -1) {
          columns.push(`${ key }.${ prop }`);
        } else if (key === 'dtGeneral' && prop === 'bannerImg') {
          columns.push(`${ key }.${ prop }`);
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
          lines.push(record);
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

        delete this.csv;
        this.importing = false;
        this.ref.detectChanges();

        resolve([ ]);
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

    this.importing = true;
    this.ref.detectChanges();

    const finishImport = () => {
      this.importing = false;
      this.ref.detectChanges();
    };

    // show only lines, that are currently importing and some lines around
    if (this.lines.length > 0) {
      await prottle(20, this.lines.map((line, i) => async () => {
        if (this.stopped || line.contractAddress) {
          return;
        }

        //remove previous error
        delete line.error;

        // show current indexing entries
        this.currIndexingStart = i - (i % this.displayLimit);
        this.linesToDisplay = this.lines.slice(this.currIndexingStart,
          this.currIndexingStart + this.displayLimit);

        // iterate through the data of the line and build the correct metadata to save
        const metadata = { };
        for (let key of Object.keys(line)) {
          const split = key.split('.');

          if (split.length < 2) {
            continue;
          }

          metadata[split[0]] = metadata[split[0]] || { };

          // if it's a member field, try to parse it into an array and check, if valid account ids
          // were insertedq
          if (split[1] === 'sharedMembers' ||
              this.dataSchema[split[0]].properties[split[1]].type === 'array') {
            metadata[split[0]][split[1]] = line[key].replace(/\'|\"/g, '').split(',');

            // remove empty accounts
            metadata[split[0]][split[1]] = metadata[split[0]][split[1]]
              .filter(accountId => !!accountId);

            for (let accountId of metadata[split[0]][split[1]]) {
              if (!this.bcc.web3.utils.isAddress(accountId)) {
                line.error = this.translateService.instant(
                  '_<%= dbcpName %>.invalid-address-desc',
                  { address: accountId }
                );

                return;
              }
            }
          } else if (split[1] === 'bannerImg') {
            metadata[split[0]][split[1]] = [{
              blobURI: this.<%= cleanName %>ServiceInstance.defaultBannerImg,
              disableEncryption: true
            }];
          } else {
            metadata[split[0]][split[1]] = line[key];
          }
        }

        /**
         * fill empty file and pictures props using an empty array
         *
         * @param      {any}  fileProps  file / picture properties
         */
        const fillFileProps = (fileProps: any) => {
          for (let dataSetKey of Object.keys(fileProps)) {
            for (let prop of fileProps[dataSetKey]) {
              metadata[dataSetKey] = metadata[dataSetKey] || { };
              metadata[dataSetKey][prop] = metadata[dataSetKey][prop] || [ ];
            }
          }
        };

        // fill empty file and pictures props using an empty array
        fillFileProps(this.<%= cleanName %>ServiceInstance.fileProps);
        fillFileProps(this.<%= cleanName %>ServiceInstance.pictureProps);

        line.loading = true;
        this.ref.detectChanges();

        // create the twin!
        try {
          const result = await this.<%= cleanName %>ServiceInstance.createDigitalTwins([{
            disableFavorite: true,
            formData: metadata,
          }]);

          line.contractAddress = result[0];
        } catch (ex) {
          line.error = ex.message;
        }

        line.loading = false;
        this.ref.detectChanges();
      }));
    }
   
    this.importingDone = true;
    finishImport();
  }

  /**
   * Adjust the lines to display by paging the "pageAdjust" value (-20 / +20)
   *
   * @param      {number}  pageAdjust  page adjust (-20 / +20)
   */
  async pageLines(pageAdjust: number) {
    this.currIndexingStart = this.currIndexingStart + pageAdjust;

    if (this.currIndexingStart + this.displayLimit > this.lines.length) {
      this.currIndexingStart = this.lines.length - this.displayLimit;
    }

    if (this.currIndexingStart < 0) {
      this.currIndexingStart = 0;
    }

    this.linesToDisplay = this.lines.slice(this.currIndexingStart,
      this.currIndexingStart + this.displayLimit);

    this.ref.detectChanges();
  }

  /**
   * Download the digital twin template.
   *
   * @return     {Promise<void}  { description_of_the_return_value }
   */
  async downloadTemplate() {
    const content = [
      this.columns.join(';'), 
      this.columns.map((value, index) => {
        const split = value.split('.');

        if (split.length > 1) {
          if (split[1] === 'sharedMembers' ||
            this.dataSchema[split[0]].properties[split[1]].type === 'array') {
            return `"0x000...,0x0001..."`;
          } else if (split[0] === 'dtGeneral' && split[1] === 'bannerImg') {
            return this.<%= cleanName %>ServiceInstance.defaultBannerImg;
          } else {
            return `Test value ${ index }`;
          }
        } else {
          return '';
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
      this.columns.join(';'),
    ].concat(
      this.lines.map((line) => this.columns.map(column => line[column]).join(';'))
    ).join('\n');

    let blob = new Blob([content],{type: 'text/csv;charset=utf-8;'});
    window.open(URL.createObjectURL(blob), '_blank');
  }

  /**
   * Opens a contract address within a new window
   *
   * @param      {string}  contractAddress  contract address to open
   */
  openContract(contractAddress: string) {
    window.open(window.location.href.replace('csv-import', contractAddress), '_blank');
  }
}
