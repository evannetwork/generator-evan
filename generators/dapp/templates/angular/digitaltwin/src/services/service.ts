import {
  utils, browserCore, queue, getDomainName
} from 'dapp-browser';

import {
  DomSanitizer,
  Injectable,
  Observable,
  OnDestroy,
  Platform,
  Subscription,
} from 'angular-libs';

import {
  EvanBCCService,
  EvanBcService,
  EvanCoreService,
  EvanDescriptionService,
  EvanFileService,
  EvanPictureService,
  EvanQueue,
  EvanTranslationService,
  EvanUtilService,
  QueueId,
  SingletonService,
} from 'angular-core';

/**************************************************************************************************/
/**
 * Utility service for the whole <%= cleanName %> DApp
 */
@Injectable()
export class <%= cleanName %>Service implements OnDestroy {
  /**
   * Initialized queueId to simple add data to a queue.
   */
  public queueId: QueueId;

  /**
   * used to format files and pictures into the correct format for saving
   */
  public pictureProps: any = <%- digitaltwinPicProps %>;
  public fileProps: any = <%- digitaltwinFileProps %>;

  /**
   * load dt details triggers sharing.clearCache, but while the dispatchers running, clearCache will
   * triggers errors!
   */
  public lockLoadClearCache: boolean;

  /**
   * default banner image that is used initally for digital twin creation
   */
  public defaultBannerImg: string =
    'https://ipfs.test.evan.network/ipfs/QmTYC9f9aiWn2Hx5j2fTDqg6EzZXNiJpK5UBwNQUgLfF1x/banner.svg';

  /**
   * Create a singleton service instance. 
   */
  constructor(
    public _DomSanitizer: DomSanitizer,
    public bc: EvanBcService,
    public bcc: EvanBCCService,
    public core: EvanCoreService,
    public descriptionService: EvanDescriptionService,
    public fileService: EvanFileService,
    public pictureService: EvanPictureService,
    public queueService: EvanQueue,
    public singleton: SingletonService,
    public translate: EvanTranslationService,
  ) {
    return singleton.create(<%= cleanName %>Service, this, () => {
      // test dispatcher functionallity
      this.queueId = new QueueId(
        `<%= dbcpName %>.${ getDomainName() }`,
        '<%= cleanName %>Dispatcher',
        '<%= cleanName %>'
      );
    });
  }

  /**
   * Test function to check if service is working.
   */
  public testFunction() {
    console.log('Service is working :)');
  }

  /**
   * Load the details for a digital twin
   *
   * @param      {string}        contractAddress  contract address to load the data for
   * @return     {Promise<any>}  the details
   */
  public async loadDigitalTwinData(contractAddress: string) {
    const activeAccount = this.core.activeAccount();
    let formData = { };

    // if no queue is running, clear the sharing cache to directly access new data that was shared
    // with me, without reloading the page
    if (!this.lockLoadClearCache) {
      this.bcc.sharing.clearCache();
    }

    // load the description to view the dataSchema to know, which dataSets are available
    const description = await this.descriptionService.getDescription(contractAddress, true);
    const dataSetKeys = Object.keys(description.dataSchema);

    // load all defined data schema properties
    await Promise.all(dataSetKeys.map(async (dataSetKey) => {
      // each data set can be shared seperated, so it could be possible, that some users only have
      // access to one data set, all other data sets, that could not be decrypted, will throw
      try {
        formData[dataSetKey] = await this.bcc.dataContract.getEntry(
          contractAddress,
          dataSetKey,
          activeAccount
        );

        // add empty new members array to be able to invite new users
        formData[dataSetKey].newMembers = [ ];
      } catch (ex) { }
    }));

    // search for files and pictures that needs to be decrypted
    for (let dataSetKey of Object.keys(formData)) {
      const dataSet = formData[dataSetKey];

      for (let key of Object.keys(dataSet)) {
        if (this.fileProps[dataSetKey].indexOf(key) !== -1 ||
            this.pictureProps[dataSetKey].indexOf(key) !== -1) {
          try {
            const parsed = JSON.parse(dataSet[key]);

            if (parsed.private) {
              dataSet[key] = (await this.bcc.dataContract.decrypt(
                dataSet[key],
                contractAddress,
                activeAccount,
                dataSetKey
              )).private;

              // transform blobURI to security trust url, so the ui can show it
              dataSet[key] = await this.fileService.equalizeFileStructure(dataSet[key]);
            } else {
              dataSet[key] = parsed;
            }
          } catch (ex) { }
        }
      }
    }

    // check if currently anything is saving?
    const queueData = this.queueService.getQueueEntry(this.queueId, true).data;
    if (queueData.length > 0) {
      // overwrite the formData with the queue data
      for (let entry of queueData) {
        if (entry.contractAddress === contractAddress) {
          formData = Object.assign(formData, entry.formData);
        }
      }
    }

    return formData;
  }

  /**
   * Create multiple digital twins
   *
   * @param      {Array<any>}              data    array of data entries
   * @return     {Promise<Array<string>>}  array of new contract addresses
   */
  async createDigitalTwins(data: Array<any>) {
    const results = [ ];
    const activeAccount = this.core.activeAccount();
    let businessCenterContract;
    let bcDomain = '<%= bcDomain %>';
    let joinSchema = '<%= joinSchema %>';
    let dataContract = this.bcc.dataContract;

    // if a business center is used, load the business center interface, so we can check which
    // users are within the business center
    if (bcDomain) {
      const [
        businessCenter,
        businessAddress,
      ] = await Promise.all([
        this.bc.getCurrentBusinessCenter(bcDomain),
        this.bcc.nameResolver.getAddress(bcDomain)
      ]);

      businessCenterContract = await this.bcc.contractLoader.loadContract(
        'BusinessCenter',
        businessAddress
      );
      dataContract = businessCenter.dataContract;

      // check if the current member is within the bc
      const isBCMember = await this.bcc.executor.executeContractCall(
        businessCenterContract,
        'isMember',
        activeAccount,
        { from: activeAccount, }
      );

      if (!isBCMember) {
        // joinOnly or joinOrAdd
        if (joinSchema == '0' || joinSchema == '2') {
          await this.bcc.executor.executeContractTransaction(
            businessCenterContract,
            'join',
            { from: activeAccount, },
          );
        } else {
          throw new Error('You are\'nt a member of the bc and it does not allow self join.');
        }
      }
    }

    for (let entry of data) {
      const formData = entry.formData;
      const contractAddress = entry.contractAddress;

      // dont clear the cache while extending new sharing keys
      this.lockLoadClearCache = true;

      // get description for the current dapp and use it as contract metadata preset
      const description = await this.descriptionService.getDescription(
        `<%= dbcpName %>.${ getDomainName() }`,
        true
      );

      // apply latest data contract abi for evan explorer usage and documentaion
      description.abis = { own: JSON.parse(this.bcc.contracts.DataContract.interface) };

      // all data set keys that should be saved and filter them for the available data within
      // the formData object
      const dataSetKeys = Object
        .keys(description.dataSchema)
        .filter(dataSetKey => !!formData[dataSetKey]);

      // if a business center is enabled, check the new invites users, if they are already
      // members in the business center
      const bcInvites = [ ];
      if (bcDomain) {
        for (let dataSetKey of dataSetKeys) {
          if (formData[dataSetKey].newMembers) {
            for (let member of formData[dataSetKey].newMembers) {
              const isBCMember = await this.bcc.executor.executeContractCall(
                businessCenterContract,
                'isMember',
                member,
                { from: activeAccount, }
              );

              // if its not a bc member, invite!
              if (!isBCMember) {
                if (joinSchema == '1' || joinSchema == '3') {
                  bcInvites.push(member);
                } else {
                  throw new Error(`The member ${ member } is'nt a member of the bc and it does
                    not allow invites.`);
                }
              }
            }
          }
        }
      }

      // create the new data contract
      let contract;
      if (contractAddress) {
        contract = this.bcc.contractLoader.loadContract(
          'DataContractInterface',
          contractAddress
        );
      } else {
        contract = await dataContract.create(
          `testdatacontract${ bcDomain ? '.factory.<%= bcDomain %>': '' }`,
          this.bcc.core.activeAccount(),
          bcDomain,
          { public : description }
        );

        // allow all the dbcp dataSchema properties setting
        await Promise.all(dataSetKeys.map(dataSetKey =>
          Promise.all(['set'].map(modificationType =>
            this.bcc.rightsAndRoles.setOperationPermission(
              contract,
              activeAccount,
              0,
              dataSetKey,
              this.bcc.web3.utils.sha3('entry'),
              this.bcc.web3.utils.sha3(modificationType),
              true,
            )
          ))
        ));
      }

      // load the latest block number, so the encryption will work only for data after this
      // block
      const blockNumber = await this.bcc.web3.eth.getBlockNumber();

      // search for files and pictures that needs to be encrypted !important!: create new
      // metadataToSave object, to keep original queue data reference (it would throw, if we
      // adjust the files for encryption and the original object and it gets persistet into the
      // IndexDB)
      const metadataToSave: any = { };
      for (let dataSetKey of dataSetKeys) {
        const dataSet = metadataToSave[dataSetKey] = { };

        for (let key of Object.keys(formData[dataSetKey])) {
          dataSet[key] = formData[dataSetKey][key];

          // the its a file or a picture, encrypt it!
          if (this.fileProps[dataSetKey].indexOf(key) !== -1 ||
              this.pictureProps[dataSetKey].indexOf(key) !== -1) {
            // if the encryption should be disabled, continue with the next element
            if (dataSet[key].length === 0 || (dataSet[key].length > 0 &&
                dataSet[key][0].disableEncryption)) {
              dataSet[key] = JSON.stringify(dataSet[key]);
              continue;
            }

            // use the correct format for saving
            dataSet[key] = await this.fileService.equalizeFileStructure(
              dataSet[key]);

            // encrypt the data
            dataSet[key] = await this.bcc.dataContract.encrypt(
              {
                private: dataSet[key]
              },
              contract,
              activeAccount,
              dataSetKey,
              blockNumber,
              'aesBlob'
            )
          }
        }

        // merge all members together and remove the new members array from the dataset
        if (formData[dataSetKey].newMembers) {
          metadataToSave[dataSetKey].sharedMembers = metadataToSave[dataSetKey].sharedMembers
            .concat(metadataToSave[dataSetKey].newMembers);

          delete metadataToSave[dataSetKey].newMembers;
        }
      }

      // set all datacontract data sets
      await Promise.all(dataSetKeys.map(dataSetKey => 
        this.bcc.dataContract.setEntry(
          contract,
          dataSetKey,
          metadataToSave[dataSetKey],
          activeAccount
        )
      ));

      const contentKeys = { };
      const [
        hashKeyToShare,
        sharings,
      ] = await Promise.all([
        // extend sharings only once
        this.bcc.sharing.getHashKey(contract.options.address, activeAccount),
        this.bcc.sharing.getSharingsFromContract(contract),
        Promise.all(dataSetKeys.map(async (dataSetKey) => {
          contentKeys[dataSetKey] = await this.bcc.sharing.getKey(
            contract.options.address,
            activeAccount,
            dataSetKey,
            blockNumber
          );
        }))
      ]);

      // iterate through all members, check if there are within the contract and extend the
      // sharings
      const membersToInvite = [ ];
      for (let dataSetKey of dataSetKeys) {
        for (let member of metadataToSave[dataSetKey].sharedMembers) {
          const isContractMember = await this.bcc.executor.executeContractCall(
            contract,
            'isConsumer',
            member,
            { from: activeAccount, }
          );

          // only invite members once
          if (!isContractMember) {
            membersToInvite.push(member);
          }

          await this.bcc.sharing.extendSharings(
            sharings,
            activeAccount,
            member,
            dataSetKey,
            0,
            contentKeys[dataSetKey],
            null
          );

          // extend the hashKey sharing
          await this.bcc.sharing.extendSharings(
            sharings,
            activeAccount,
            member,
            '*',
            'hashKey',
            hashKeyToShare,
            null
          );
        }
      }

      await this.bcc.sharing.saveSharingsToContract(
        contract.options.address,
        sharings,
        activeAccount
      );

      // if new bc invites are availabled, invite the new members
      if (bcInvites.length > 0) {
        await Promise.all(bcInvites.map((notMember) => {
          return this.bcc.executor.executeContractTransaction(
            businessCenterContract,
            'invite',
            { from: activeAccount, autoGas: 1.1, },
            notMember
          );
        }));
      }

      if (membersToInvite.length > 0) {
        // build bmail for invited user
        const bMailContent = {
          content: {
            from: activeAccount,
            fromAlias: await this.bcc.profile.getProfileKey('alias', activeAccount),
            title: this.translate.instant('_<%= dbcpName %>.contract-invitation.text-title'),
            body: this.translate.instant('_<%= dbcpName %>.contract-invitation.text-body', {
              contractAddress: contract.options.address,
            }),
            attachments: [{
              address: contract.options.address,
              type: 'contract',
            }]
          }
        };

        // invite all members into the contract and send an invitation mail
        await Promise.all(membersToInvite.map(async (member) => {
          return Promise.all([
            this.bcc.dataContract.inviteToContract(
              bcDomain,
              contract.options.address,
              activeAccount,
              member
            ),
            this.bcc.mailbox.sendMail(
              bMailContent,
              activeAccount,
              member
            ),
          ]);
        }));
      }

      // add the bookmark if its not exists before
      if (!contractAddress && !entry.disableFavorite) {
        description.trimmedName = formData.dtGeneral.type.replace(/\s|\./g, '');
        description.i18n.name = {
          de: formData.dtGeneral.type,
          en: formData.dtGeneral.type,
        };
        await this.bcc.profile.loadForAccount(this.bcc.profile.treeLabels.bookmarkedDapps);
        await this.bcc.profile.addDappBookmark(contract.options.address, description);
        await this.bcc.profile.storeForAccount(this.bcc.profile.treeLabels.bookmarkedDapps);
      }

      results.push(contract._address);
    }

    // enable clear cache to load latest data everytime
    this.lockLoadClearCache = false;

    return results;
  }
}
