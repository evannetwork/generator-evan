import {
  ChangeDetectorRef,
  Component,
  DomSanitizer,
  OnDestroy,
  OnInit,
} from 'angular-libs';

import {
  AsyncComponent,
  createOpacityTransition,
  createRouterTransition,
  EvanBCCService,
  EvanCoreService,
  EvanDescriptionService,
  EvanMailboxService,
  EvanRoutingService,
} from 'angular-core';

/**************************************************************************************************/

@Component({
  selector: '<%= cleanName %>-root',
  templateUrl: 'root.html',
  animations: [
    createOpacityTransition(),
    createRouterTransition([
      // insert router transitions here
    ])
  ]
})

/**
 * Root component for handle routing and navigation.
 *
 * @class      RootComponent (name)
 */
export class RootComponent extends AsyncComponent {
  /**
   * Watch for route changes to update the current router-refs
   */
  private watchRouteChange: Function;

  /**
   * array of loaded DBCP's definition of predefined dapps to provide an dapp side panel navigation 
   */
  private dapps: Array<any>;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private bcc: EvanBCCService,
    private core: EvanCoreService,
    private descriptionService: EvanDescriptionService,
    private mailboxService: EvanMailboxService,
    private ref: ChangeDetectorRef,
    private routingService: EvanRoutingService,
  ) {
    super(ref);
  }

  /**
   * Initialize the component and wait for evan.network processes to be finished.
   * 
   * @return     {Promise<void>}  resolved when done
   */
  async _ngOnInit() {
    // initialize DBCP and blockchain-core and provide the default password dialog to unlock current
    // users wallet
    await this.bcc.initialize((accountId) => this.bcc.globalPasswordDialog(accountId));
    
    // Watch for route changes to update the current router-refs
    this.watchRouteChange = this.routingService.subscribeRouteChange(() => this.ref.detectChanges());

    // load predefine dapps that should be available as suggestion
    this.dapps = await this.descriptionService.getMultipleDescriptions([
      'favorites',
      'addressbook',
      'mailbox',
      'profile'
    ]);

    // tell the dapp-browser to hide the initial loading screen
    this.core.finishDAppLoading();
  }

  /**
   * Remove route watchers
   *
   * @return     {Promise<void>}  resolved when done
   */
  async _ngOnDestroy() {
    this.watchRouteChange();
  }
}
