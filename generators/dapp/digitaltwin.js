module.exports = async function(projectName, dbcpName) {
  let stop;

  let dataSets = [
    {
      display: 'Dataset 1',
      technical: 'dataset1',
      fields: [
        {
          display: 'Text',
          technical: 'text',
          type: 'text',
        },
        {
          display: 'Date',
          technical: 'date',
          type: 'date',
        },
        {
          display: 'Members',
          technical: 'members',
          type: 'members',
        },
        {
          display: 'Files',
          technical: 'files',
          type: 'files',
        },
        {
          display: 'Pictures',
          technical: 'pictures',
          type: 'pictures',
        },
      ]
    },
    {
      display: 'Dataset 2',
      technical: 'dataset2',
      fields: [
        {
          display: 'Text',
          technical: 'text',
          type: 'text',
        },
        {
          display: 'Date',
          technical: 'date',
          type: 'date',
        },
        {
          display: 'Members',
          technical: 'members',
          type: 'members',
        },
        {
          display: 'Files',
          technical: 'files',
          type: 'files',
        },
        {
          display: 'Pictures',
          technical: 'pictures',
          type: 'pictures',
        },
      ]
    }
  ];

  /**
   * use this function for required inquirer fields
   */
  const validateFunc = (input) => {
    if (!input) {
      return 'Please specify a value!';
    } else {
      return true;
    }
  }

  while (!stop) {
    console.clear();
    console.log('New Digitaltwin template: ' + projectName);
    console.log('----------------------------------------\n');

    dataSets.forEach(dataSet => {
      console.log(`${ dataSet.display } (${ dataSet.technical }): \n`);

      dataSet.fields.forEach((field, index) => 
        console.log(`  ${ index + 1 }. ${ field.display } : ${ field.technical } (${ field.type })`)
      );

      console.log('\n');
    });

    // choices to select within the first menu
    const menuChoices = [
      {
        name: 'Add data set',
        value: 'add-dataset'
      },
      {
        name: 'Remove data set',
        value: 'remove-dataset'
      },
      {
        name: 'Add field',
        value: 'add-field'
      },
      {
        name: 'Remove field',
        value: 'remove-field'
      },
      {
        name: 'finish',
        value: 'finish'
      },
    ];

    if (dataSets.length === 0) {
      menuChoices.splice(1, 0);
    }

    // ask for user action
    const menuResult = (await this.prompt([
      {
        type : 'list',
        name : 'menuResult',
        message : 'Would you like to add metadata to your Digitaltwin?',
        choices: menuChoices
      }
    ])).menuResult;

    switch (menuResult) {
      case 'add-dataset': {
        const newDataSet = await this.prompt([
          {
            type : 'input',
            name : 'display',
            message : 'Displayname of the dataset',
            validate: validateFunc
          },
          {
            type : 'input',
            name : 'technical',
            message : 'technical name of the dataset',
            validate: (input) => {
              if (!input) {
                return 'Please specify a value!';
              } else if (/[^A-Za-z0-9]/.test(input)) {
                return 'The technical name should not include special characters!';
              } else if (input === 'dtGeneral') {
                return 'The dataset "dtGeneral" is reserved!';
              } else if (dataSets.filter(dataSet => dataSet.technical === input).length > 0) {
                return 'A data set with the same technical name already exists!';
              } else {
                return true;
              }
            }
          },
        ]);

        // add fields array
        newDataSet.fields = [ ];

        dataSets.push(newDataSet);

        break;
      }

      case 'remove-dataset': {
        const toRemove = (await this.prompt([
          {
            type : 'checkbox',
            name : 'toRemove',
            message : 'Dataset that should be removed',
            validate: validateFunc,
            choices: dataSets.map((dataSet, index) => {
              return {
                name: `${ dataSet.display } (${ dataSet.technical })`,
                value: index,
              }
            })
          }
         ])).toRemove;

        for (let index of toRemove) {
          dataSets.splice(index, 1);
        }

        break;
      }
      case 'add-field': {
        const dataSet = (await this.prompt([
          {
            type : 'list',
            name : 'dataSet',
            message : 'Dataset to add the property to',
            validate: validateFunc,
            choices: dataSets.map((dataSet, index) => {
              return {
                name: `${ dataSet.display } (${ dataSet.technical })`,
                value: index,
              }
            })
          }])).dataSet;

        const newField = await this.prompt([
          {
            type : 'input',
            name : 'display',
            message : 'Displayname of the property',
            validate: validateFunc
          },
          {
            type : 'input',
            name : 'technical',
            message : 'technical name of the property',
            validate: (input) => {
              if (!input) {
                return 'Please specify a value!';
              } else if (/[^A-Za-z0-9]/.test(input)) {
                return 'The technical name should not include special characters!';
              } if (input === 'sharedMembers') {
                return 'The dataset "sharedMembers" is reserved!';
              } else {
                const fieldsToCheck = dataSets[dataSet].fields;

                if (fieldsToCheck.filter(field => field.technical === input).length > 0) {
                  return 'A data set with the same technical name already exists!';
                } else {
                  return true;
                }
              }
            }
          },
          {
            type : 'list',
            name : 'type',
            message : 'type of the property',
            validate: validateFunc,
            choices: [
              {
                name: 'Text',
                value: 'text'
              },
              {
                name: 'Date',
                value: 'date'
              },
              {
                name: 'Members',
                value: 'members'
              },
              {
                name: 'Files',
                value: 'files'
              },
              {
                name: 'Pictures',
                value: 'pictures'
              },
            ]
          },
        ]);

        dataSets[dataSet].fields.push(newField);

        break;
      }
      case 'remove-field': {
        const dataSet = (await this.prompt([
          {
            type : 'list',
            name : 'dataSet',
            message : 'Dataset to remove the property from',
            validate: validateFunc,
            choices: dataSets.map((dataSet, index) => {
              return {
                name: `${ dataSet.display } (${ dataSet.technical })`,
                value: index,
              }
            })
          }
        ])).dataSet;

        const toRemove = (await this.prompt([
          {
            type : 'checkbox',
            name : 'toRemove',
            message : 'Fields that should be removed',
            validate: validateFunc,
            choices: dataSets[dataSet].fields.map((field, index) => {
              return {
                name: `${ index + 1 }. ${ field.display } : ${ field.technical } (${ field.type })`,
                value: field,
              }
            })
          }
         ])).toRemove;

        for (let field of toRemove) {
          dataSets[dataSet].fields.splice(dataSets[dataSet].fields.indexOf(field), 1);
        }

        break;
      }
      case 'finish': {
        stop = true;

        break;
      }
    }
  }

  // all the result values
  let digitaltwinDataSchema = {
    'dtGeneral': {
      '$id': 'dataset2_schema',
      'additionalProperties': true,
      'properties': {
        'bannerImg': {
          'type': 'string'
        },
        'type': {
          'type': 'string'
        },
        'sharedMembers': {
          'items': {
            'type': 'string'
          },
          'type': 'array'
        }
      },
      'type': 'object',
      'required': [
        'bannerImg',
        'type',
        'sharedMembers'
      ]
    }
  };
  let digitaltwinDetailTpl = [ ];
  let digitaltwinEditTpl = [ ];
  let digitaltwinFileProps = {
    dtGeneral: [ ]
  };
  let digitaltwinFormData = {
    dtGeneral: {
      sharedMembers: [ ]
    }
  };
  let digitaltwinPicProps = {
    dtGeneral: [ 'bannerImg' ]
  };

  // transform field results into the dbcp field configurations
  dataSets = dataSets.forEach(dataSet => {
    let dataSchemaProperties = {
      'sharedMembers': {
        'items': {
          'type': 'string'
        },
        'type': 'array'
      }
    };
    let detailTpl = [ ];
    let editTpl = [ ];
    let fileProperties = [ ];
    let formData = {
      sharedMembers: [ ]
    };
    let pictureProperties = [ ];
    let requiredFields = [ ];

    dataSet.fields.forEach((field) => {
      field.technical = field.technical.replace(/\ /g, '');

      requiredFields.push(field.technical);
      switch (field.type) {
        case 'text':
        case 'files':
        case 'pictures':
        case 'date': {
          dataSchemaProperties[field.technical] = {
            'type': 'string'
          }

          break;
        }
        case 'members': {
          dataSchemaProperties[field.technical] = {
            'items': {
              'type': 'string'
            },
            'type': 'array'
          };

          break;
        }
      }
    });

    // apply templates for each field
    dataSet.fields.forEach((field) => {
      switch (field.type) {
        case 'text': {
          editTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-item>
            <ion-label stacked>${ field.display }*</ion-label>
            <ion-input name="${ dataSet.technical }-${ field.technical }" required
              [(ngModel)]="formData.${ dataSet.technical }.${ field.technical }"
              placeholder="${ field.display }"
              (ionChange)="ref.detectChanges()"
              (focusout)="ref.detectChanges()">
            </ion-input>
          </ion-item>
          <ion-chip class="error-hint" *ngIf="showError('${ dataSet.technical }-${ field.technical }')" color="danger">
            <ion-label>Please insert value for ${ field.display }</ion-label>
          </ion-chip>
        </ion-col>
          `);

          detailTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-label class="standalone">${ field.display }</ion-label>
          <span>{{ formData.${ dataSet.technical }.${ field.technical } }}</span>
        </ion-col>
          `);

          break;
        }
        case 'date': {
          editTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-item>
            <ion-label stacked>${ field.display }*</ion-label>
            <ion-datetime name="${ dataSet.technical }-${ field.technical }"
              required="true"
              displayFormat="DD-MM-YYYY"
              pickerFormat="DD-MMM-YYYY"
              [(ngModel)]="formData.${ dataSet.technical }.${ field.technical }"
              placeholder="${ field.display }"
              cancelText="cancel"
              doneText="done"
              minuteValues="0,15,30,45"
              [min]="now"
              [max]="maxDate"
              [monthShortNames]="translateService.monthShortNames"
              (ionChange)="ref.detectChanges()"
              (focusout)="ref.detectChanges()">
            </ion-datetime>
          </ion-item>
          <ion-chip class="error-hint" *ngIf="showError('${ dataSet.technical }-${ field.technical }')" color="danger">
            <ion-label>Please insert value for ${ field.display }</ion-label>
          </ion-chip>
        </ion-col>
          `);

          detailTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-label class="standalone">${ field.display }</ion-label>
          <span>{{ formData.${ dataSet.technical }.${ field.technical } | date:'medium':'':translateService.translate.currentLang }}</span>
        </ion-col>
          `);

          break;
        }
        case 'members': {
          formData[field.technical] = [ ];
          editTpl.push(`
        <ion-col col-12 col-md-6>
          <contract-members #${ dataSet.technical }${ field.technical }Comp
            [(members)]="formData.${ dataSet.technical }.${ field.technical }"
            (onChange)="ref.detectChanges()">
            <h3 label>${ field.display }</h3>
          </contract-members>
          <ion-chip class="error-hint" *ngIf="${ dataSet.technical }${ field.technical }Comp.touched && formData.${ dataSet.technical }.${ field.technical }.length === 0" color="danger">
            <ion-label>Please insert value for ${ field.display }</ion-label>
          </ion-chip>
        </ion-col>
          `);

          detailTpl.push(`
        <ion-col col-12 col-md-6>
          <contract-members #${ dataSet.technical }${ field.technical }Comp
            [(origin)]="formData.${ dataSet.technical }.${ field.technical }"
            [readonly]="true">
            <h3 label>${ field.display }</h3>
          </contract-members>
        </ion-col>
          `);

          break;
        }
        case 'files': {
          fileProperties.push(field.technical);
          formData[field.technical] = [ ];
          editTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-label class="standalone">${ field.display }</ion-label>
          <evan-file-select name="${ dataSet.technical }-${ field.technical }" #${ field.technical }FileSelect text-center
            [minFiles]="1"
            [(ngModel)]="formData.${ dataSet.technical }.${ field.technical }"
            (onChange)="ref.detectChanges()">
          </evan-file-select>
        </ion-col>
          `);

          detailTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-label class="standalone">${ field.display }</ion-label>
          <evan-file-select name="${ dataSet.technical }-${ field.technical }" #${ field.technical }FileSelect
            [minFiles]="1"
            [(ngModel)]="formData.${ dataSet.technical }.${ field.technical }"
            disabled="true"
            downloadable="true">
          </evan-file-select>
        </ion-col>
          `);

          break;
        }
        case 'pictures': {
          pictureProperties.push(field.technical);
          formData[field.technical] = [ ];

          editTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-item class="evan-relative">
            <ion-label stacked class="standalone">
              ${ field.display }
            </ion-label>
            <div item-content text-left class="picture-container">
              <div class="evan-relative"
                *ngFor="let picture of formData.${ dataSet.technical }.${ field.technical }; let picIndex = index">
                <img class="clickable"
                  [src]="picture.blobURI"
                  (click)="openPictureDetail(picture.blobURI)"
                />
                <button class="top-right" ion-button round icon-only color="danger"
                  (click)="removePicture(formData.${ dataSet.technical }.${ field.technical }, picIndex)">
                  <ion-icon name="trash" color="light"></ion-icon>
                </button>
              </div>
              <br>
              <div class="empty-pictures" margin-bottom
                *ngIf="formData.${ dataSet.technical }.${ field.technical }.length === 0">
                no pictures taken
              </div>
            </div>
          </ion-item>
          <div text-center margin-top>
            <button ion-button round outline icon-start
              (click)="takeSnapshot(formData.${ dataSet.technical }.${ field.technical })">
              <ion-icon name="camera"></ion-icon>
              take snapshot
            </button>
          </div>
        </ion-col>
          `);

          detailTpl.push(`
        <ion-col col-12 col-md-6>
          <ion-item class="evan-relative">
            <ion-label stacked class="standalone">
              ${ field.display }
            </ion-label>
            <div item-content text-left class="picture-container">
              <div class="evan-relative"
                *ngFor="let picture of formData.${ dataSet.technical }.${ field.technical }; let picIndex = index">
                <img class="clickable"
                  [src]="picture.blobURI"
                  (click)="openPictureDetail(picture.blobURI)"
                />
              </div>
              <br>
              <div class="empty-pictures" *ngIf="formData.${ dataSet.technical }.${ field.technical }.length === 0">
                no pictures taken
              </div>
            </div>
          </ion-item>
        </ion-col>
          `);

          break;
        }
      }
    });

    digitaltwinDataSchema[dataSet.technical] = {
      "$id": `${ dataSet.technical }_schema`,
      "additionalProperties": true,
      "properties": dataSchemaProperties,
      "type": "object",
      "required": requiredFields
    };

    digitaltwinDetailTpl.push(`
      <div class="evan-content evan-relative">
        <h3 class="content-header m-b-0 m-t-0">
          ${ dataSet.display }
        </h3>
        <ion-row margin-top>
          ${ detailTpl.join('\n') }
        </ion-row>
      </div>
    `);

    digitaltwinEditTpl.push(`
      <div class="evan-content evan-relative">
        <h3 class="content-header m-b-0 m-t-0">
          ${ dataSet.display }
        </h3>
        <p ion-text class="m-b-0 m-t-0">
          {{ '_${ dbcpName }.fill-empty' | translate }}
        </p>
        <ion-row margin-top>
          ${ editTpl.join('\n') }
        </ion-row>
      </div>
    `);

    digitaltwinFileProps[dataSet.technical] = fileProperties;
    digitaltwinPicProps[dataSet.technical] = pictureProperties;
    digitaltwinFormData[dataSet.technical] = formData; 
  });

  return {
    digitaltwinDataSchema: JSON.stringify(digitaltwinDataSchema, null, 2),
    digitaltwinDetailTpl: digitaltwinDetailTpl.join('\n\n'),
    digitaltwinEditTpl: digitaltwinEditTpl.join('\n\n'),
    digitaltwinFileProps: JSON.stringify(digitaltwinFileProps, null, 2),
    digitaltwinFormData: JSON.stringify(digitaltwinFormData, null, 2),
    digitaltwinPicProps: JSON.stringify(digitaltwinPicProps, null, 2),
  }
}
