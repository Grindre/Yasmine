import { EtherWallet, TWalletBaseItem } from "web3id";
import _ from "lodash";

/**
 * 	@class UserService
 */
export class UserService
{
	private mnemonicList : Array<string> = [
		'olympic cradle tragic crucial exit annual silly cloth scale fine gesture ancient',
		'evidence cement snap basket genre fantasy degree ability sunset pistol palace target',
		'electric shoot legal trial crane rib garlic claw armed snow blind advance'
	];

	private userNameList : Array<string> = [ 'Alice', 'Bob', 'Mary' ];

	//
	//	create a wallet by mnemonic
	//
	private walletObj : TWalletBaseItem | null = null;


	/**
	 * 	change current user
	 *	@param userId	{number}
	 *	@returns {void}
	 */
	public changeUser( userId : number ) : void
	{
		if ( ! _.isNumber( userId ) || userId <= 0 || userId > this.mnemonicList.length )
		{
			throw new Error( `${ this.constructor.name }.changeUser :: invalid userId` );
		}

		console.log( `⭐️ ${ this.constructor.name }.changeUser :: user changed to: `, userId, this.userNameList[ userId - 1 ], this.mnemonicList[ userId - 1 ] );
		localStorage.setItem( `current.userId`, userId.toString() );
		localStorage.setItem( `current.userName`, this.userNameList[ userId - 1 ] );
		localStorage.setItem( `current.mnemonic`, this.mnemonicList[ userId - 1 ] );

		//	create wallet
		this.walletObj = EtherWallet.createWalletFromMnemonic( this.mnemonicList[ userId - 1 ] );
		console.log( `${ this.constructor.name }.changeUser :: walletObj :`, t