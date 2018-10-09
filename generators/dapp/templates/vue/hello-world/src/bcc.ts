import * as bcc from 'bcc';
import * as SmartContracts from 'smart-contracts';
import {
  AccountStore,
  config,
  getCoreOptions,
  getDomainName,
  getLatestKeyProvider,
  KeyProvider,
  lightwallet,
  queue,
  updateCoreRuntime,
  web3,
  web3Helper,
  core,
} from 'dapp-browser';

/**
 * Returns the existing executor or creates a new one, for the active current
 * provider.
 *
 * @param      {string}                        provider  The provider
 * @return     {ProfileBundle.SignerInternal}  The signer.
 */
function getSigner(provider = core.getCurrentProvider()) {
  let signer;
  if (provider === 'internal') {
    signer = new bcc.SignerInternal({
      accountStore: new AccountStore(),
      config: { },
      contractLoader: bcc.CoreRuntime.contractLoader,
      web3: bcc.CoreRuntime.web3,
      logLog: bcc.logLog,
      logLogLevel: bcc.logLogLevel
    });
  } else {
    signer = new bcc.SignerExternal({
      logLog: bcc.logLog,
      logLogLevel: bcc.logLogLevel
    })
  }

  return signer;
}


/**
 * run keyExchange.setPublicKey
 *
 * @param      {string}  accountId  Account id to set the exchange keys for
 */
async function setExchangeKeys(accountId = core.activeAccount()): Promise<void> {
  const targetPubKey = await bcc.ProfileRuntime.profile.getPublicKey();
  const targetPrivateKey = await bcc.ProfileRuntime.profile.getContactKey(
    accountId,
    'dataKey'
  );

  if (!!targetPrivateKey) {
    bcc.ProfileRuntime.keyExchange.setPublicKey(targetPubKey, targetPrivateKey);
  }
}

/**
 * Setup / update initial blockchain-core structure for current account id and
 * signer.
 *
 * @return     {Promise<void>}  solved when bcc is updated
 */
export default async function startBCC() {
  if (!bcc.ProfileRuntime) {
    const activeAccount = core.activeAccount();
    const provider = core.getCurrentProvider();
    const coreOptions = await getCoreOptions(bcc, SmartContracts, provider);

    await bcc.createAndSetCore(coreOptions);

    const bccProfileOptions: any ={
      accountId: core.activeAccount(),
      CoreBundle: bcc,
      coreOptions: coreOptions,
      keyProvider: getLatestKeyProvider(),
      signer: getSigner(provider),
      SmartContracts: SmartContracts
    };

    // if we are loading all data via an smart-agent, we need to create a new ExecutorAgent
    if (provider === 'agent-executor') {
      const agentExecutor = await core.getAgentExecutor();

      bccProfileOptions.executor = new bcc.ExecutorAgent({
        agentUrl: agentExecutor.agentUrl,
        config: {},
        contractLoader: bcc.CoreRuntime.contractLoader,
        logLog: bcc.logLog,
        logLogLevel: bcc.logLogLevel,
        signer: bccProfileOptions,
        token: agentExecutor.token,
        web3: bcc.CoreRuntime.web3,
      });
    }

    // initialize bcc for an profile
    const bccProfile = bcc.createAndSet(bccProfileOptions);

    if (provider === 'metamask') {
      bcc.ProfileRuntime.coreInstance.executor.eventHub.eventWeb3 = (<any>window).web3;
    }

    await bcc.ProfileRuntime.keyProvider.setKeys();
    await setExchangeKeys(activeAccount);
  }
}

/**
 * Returns an new blockchain-core profile instance. !Attention : It's only
 * builded for load values to check for public and private keys (e.g. used by
 * onboarding or global-password) Executor is the normal one from the global
 * core!!!
 *
 * @param      {string}                 accountId  account id to create a new
 *                                                 profile instance for
 * @return     {ProfileBundle.Profile}  The profile for account.
 */
export async function getProfileForAccount(accountId: string) {
  const keys = getLatestKeyProvider().keys;
  const keyProvider = new KeyProvider(
    keys ? JSON.parse(JSON.stringify(keys)) : { },
    accountId,
  );

  const cryptoProvider = new bcc.CryptoProvider({
    unencrypted: new bcc.Unencrypted(),
    aes: new bcc.Aes(),
    aesEcb: new bcc.AesEcb(),
    logLog: bcc.logLog,
    logLogLevel: bcc.logLogLevel
  });

  // set dummy encryption keys to prevent password dialog
  // !Attention : Only public key can be get! If you want to get crypted values
  //              set it by yourself
  keyProvider.setKeysForAccount(
    accountId,
    lightwallet.getEncryptionKeyFromPassword('unencrypted')
  );

  const ipldInstance = new bcc.Ipld({
    'ipfs': bcc.CoreRuntime.dfs,
    'keyProvider': keyProvider,
    'cryptoProvider': cryptoProvider,
    defaultCryptoAlgo: 'aes',
    originator: accountId,
    logLog: bcc.logLog,
    logLogLevel: bcc.logLogLevel
  });

  const sharing = new bcc.Sharing({
    contractLoader: bcc.CoreRuntime.contractLoader,
    cryptoProvider: cryptoProvider,
    description: bcc.CoreRuntime.description,
    executor: bcc.CoreRuntime.executor,
    dfs: bcc.CoreRuntime.dfs,
    keyProvider: keyProvider,
    nameResolver: bcc.CoreRuntime.nameResolver,
    defaultCryptoAlgo: 'aes',
    logLog: bcc.logLog,
    logLogLevel: bcc.logLogLevel
  });

  const dataContract = new bcc.DataContract({
    cryptoProvider: cryptoProvider,
    dfs: bcc.CoreRuntime.dfs,
    executor: bcc.CoreRuntime.executor,
    loader: bcc.CoreRuntime.contractLoader,
    nameResolver: bcc.CoreRuntime.nameResolver,
    sharing: sharing,
    web3: bcc.CoreRuntime.web3,
    description: bcc.CoreRuntime.description,
    logLog: bcc.logLog,
    logLogLevel: bcc.logLogLevel
  });

  const evanProfile = new bcc.Profile({
    ipld: ipldInstance,
    nameResolver: bcc.CoreRuntime.nameResolver,
    defaultCryptoAlgo: 'aes',
    executor: bcc.CoreRuntime.executor,
    contractLoader: bcc.CoreRuntime.contractLoader,
    accountId: accountId,
    dataContract,
    logLog: bcc.logLog,
    logLogLevel: bcc.logLogLevel
  });

  keyProvider.profile = evanProfile;

  return evanProfile;
}
