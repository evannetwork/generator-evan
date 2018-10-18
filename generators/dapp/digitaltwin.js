module.exports = async function(projectName) {
  let stop;
  const digitaltwinFields = [
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
  ];


  while (!stop) {
    console.clear();
    console.log('New Digitaltwin template: ' + projectName);
    console.log('----------------------------------------\n');

    if (digitaltwinFields.length > 0) {
      console.log('Fields: \n');

      for (let i = 0; i < digitaltwinFields.length; i++) {
        const field = digitaltwinFields[i];
        console.log(`  ${ i + 1 }. ${ field.display } : ${ field.technical } (${ field.type })`);
      }
      console.log('\n')
    }

    const menuResult = (await this.prompt([
      {
        type    : 'list',
        name    : 'menuResult',
        message : 'Would you like to add metadata to your Digitaltwin?',
        choices: [
          {
            name: 'Add field',
            value: 'addmetadata'
          },
          {
            name: 'finish',
            value: 'finish'
          },
        ]
      }
    ])).menuResult;

    if (menuResult === 'finish') {
      stop = true;
    } else {
      const newField = await this.prompt([
        {
          type    : 'input',
          name    : 'display',
          message : 'Displayname of the property',
          required: true
        },
        {
          type    : 'input',
          name    : 'technical',
          message : 'technical name of the property',
          required: true
        },
        {
          type    : 'list',
          name    : 'type',
          message : 'type of the property',
          required: true,
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

      digitaltwinFields.push(newField);
    }
  }

  // transform field results into the dbcp field configurations
  let digitaltwinDBCPFields = { };
  let digitaltwinEditTpl = [ ];
  let digitaltwinDetailTpl = [ ];
  let digitaltwinFormData = { };
  let digitaltwinPicProps = [ ];
  let digitaltwinFileProps = [ ];
  let digitaltwinDBCPRequiredFields = [ ];

  digitaltwinFields.forEach((field) => {
    field.technical = field.technical.replace(/\ /g, '');

    digitaltwinDBCPRequiredFields.push(field.technical);
    switch (field.type) {
      case 'text':
      case 'files':
      case 'pictures':
      case 'date': {
        digitaltwinDBCPFields[field.technical] = {
          'type': 'string'
        }

        break;
      }
      case 'members': {
        digitaltwinDBCPFields[field.technical] = {
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
  digitaltwinFields.forEach((field) => {
    switch (field.type) {
      case 'text': {
        digitaltwinEditTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-item>
          <ion-label stacked>${ field.display }*</ion-label>
          <ion-input name="${ field.technical }" required
            [(ngModel)]="formData.${ field.technical }"
            placeholder="${ field.display }"
            (ionChange)="ref.detectChanges()"
            (focusout)="ref.detectChanges()">
          </ion-input>
        </ion-item>
        <ion-chip class="error-hint" *ngIf="showError('${ field.technical }')" color="danger">
          <ion-label>Please insert value for ${ field.display }</ion-label>
        </ion-chip>
      </ion-col>
        `);

        digitaltwinDetailTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-label class="standalone">${ field.display }</ion-label>
        <span>{{ formData.${ field.technical } }}</span>
      </ion-col>
        `);

        break;
      }
      case 'date': {
        digitaltwinEditTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-item>
          <ion-label stacked>${ field.display }*</ion-label>
          <ion-datetime name="${ field.technical }"
            required="true"
            displayFormat="DD-MM-YYYY"
            pickerFormat="DD-MMM-YYYY"
            [(ngModel)]="formData.${ field.technical }"
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
        <ion-chip class="error-hint" *ngIf="showError('${ field.technical }')" color="danger">
          <ion-label>Please insert value for ${ field.display }</ion-label>
        </ion-chip>
      </ion-col>
        `);

        digitaltwinDetailTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-label class="standalone">${ field.display }</ion-label>
        <span>{{ formData.${ field.technical } | date:'medium':'':translateService.translate.currentLang }}</span>
      </ion-col>
        `);

        break;
      }
      case 'members': {
        digitaltwinFormData[field.technical] = [ ];
        digitaltwinEditTpl.push(`
      <ion-col col-12 col-md-6>
        <contract-members #${ field.technical }Comp
          [(members)]="formData.${ field.technical }"
          (onChange)="ref.detectChanges()">
          <h3 label>${ field.display }</h3>
        </contract-members>
        <ion-chip class="error-hint" *ngIf="${ field.technical }Comp.touched && formData.${ field.technical }.length === 0" color="danger">
          <ion-label>Please insert value for ${ field.display }</ion-label>
        </ion-chip>
      </ion-col>
        `);

        digitaltwinDetailTpl.push(`
      <ion-col col-12 col-md-6>
        <contract-members #${ field.technical }Comp
          [(origin)]="formData.${ field.technical }"
          [readonly]="true">
          <h3 label>${ field.display }</h3>
        </contract-members>
      </ion-col>
        `);

        break;
      }
      case 'files': {
        digitaltwinFileProps.push(field.technical);
        digitaltwinFormData[field.technical] = [ ];
        digitaltwinEditTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-label class="standalone">${ field.display }</ion-label>
        <evan-file-select name="${ field.technical }" #${ field.technical }FileSelect text-center
          [minFiles]="1"
          [(ngModel)]="formData.${ field.technical }"
          (onChange)="ref.detectChanges()">
        </evan-file-select>
      </ion-col>
        `);

        digitaltwinDetailTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-label class="standalone">${ field.display }</ion-label>
        <evan-file-select name="${ field.technical }" #${ field.technical }FileSelect
          [minFiles]="1"
          [(ngModel)]="formData.${ field.technical }"
          disabled="true"
          downloadable="true">
        </evan-file-select>
      </ion-col>
        `);

        break;
      }
      case 'pictures': {
        digitaltwinPicProps.push(field.technical);
        digitaltwinFormData[field.technical] = [ ];

        digitaltwinEditTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-item class="evan-relative">
          <ion-label stacked class="standalone">
            ${ field.display }
          </ion-label>
          <div item-content text-left class="picture-container">
            <div class="evan-relative"
              *ngFor="let picture of formData.${ field.technical }; let picIndex = index">
              <img class="clickable"
                [src]="picture.blobURI"
                (click)="openPictureDetail(picture.blobURI)"
              />
              <button class="top-right" ion-button round icon-only color="danger"
                (click)="removePicture(formData.${ field.technical }, picIndex)">
                <ion-icon name="trash" color="light"></ion-icon>
              </button>
            </div>
            <br>
            <div class="empty-pictures" margin-bottom
              *ngIf="formData.${ field.technical }.length === 0">
              no pictures taken
            </div>
          </div>
        </ion-item>
        <div text-center margin-top>
          <button ion-button round outline icon-start
            (click)="takeSnapshot(formData.${ field.technical })">
            <ion-icon name="camera"></ion-icon>
            take snapshot
          </button>
        </div>
      </ion-col>
        `);

        digitaltwinDetailTpl.push(`
      <ion-col col-12 col-md-6>
        <ion-item class="evan-relative">
          <ion-label stacked class="standalone">
            ${ field.display }
          </ion-label>
          <div item-content text-left class="picture-container">
            <div class="evan-relative"
              *ngFor="let picture of formData.${ field.technical }; let picIndex = index">
              <img class="clickable"
                [src]="picture.blobURI"
                (click)="openPictureDetail(picture.blobURI)"
              />
            </div>
            <br>
            <div class="empty-pictures" *ngIf="formData.${ field.technical }.length === 0">
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

  digitaltwinDBCPFields = JSON.stringify(digitaltwinDBCPFields, null, 2);
  digitaltwinEditTpl = `
    <ion-row>
      ${ digitaltwinEditTpl.join('\n') }
    </ion-row>
  `;
  digitaltwinDetailTpl = `
    <ion-row>
      ${ digitaltwinDetailTpl.join('\n') }
    </ion-row>
  `;
  digitaltwinFormData = JSON.stringify(digitaltwinFormData, null, 2);
  digitaltwinPicProps = JSON.stringify(digitaltwinPicProps, null, 2);
  digitaltwinFileProps = JSON.stringify(digitaltwinFileProps, null, 2);
  digitaltwinDBCPRequiredFields = JSON.stringify(digitaltwinDBCPRequiredFields, null, 2);

  return {
    digitaltwinDBCPFields,
    digitaltwinDBCPRequiredFields,
    digitaltwinDetailTpl,
    digitaltwinEditTpl,
    digitaltwinFileProps,
    digitaltwinFormData,
    digitaltwinPicProps,
  }
}