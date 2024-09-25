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
		console.log( `${ this.constructor.name }.changeUser :: walletObj :`, this.walletObj );
	}

	/**
	 * 	get wallet object
	 * 	@returns {TWalletBaseItem | null}
	 */
	public getWallet() : TWalletBaseItem | null
	{
		if ( this.walletObj )
		{
			return this.walletObj;
		}

		//	...
		const mnemonic : string | null = localStorage.getItem( `current.mnemonic` );
		if ( ! _.isString( mnemonic ) || _.isEmpty( mnemonic ) )
		{
			throw new Error( `${ this.constructor.name }.getWallet :: current.mnemonic empty` );
		}

		//	create wallet
		this.walletObj = EtherWallet.createWalletFromMnemonic( mnemonic );
		if ( ! this.walletObj )
		{
			throw new Error( `${ this.constructor.name }.getWallet :: failed to create walletObj` );
		}

		//	...
		this.walletObj.address = this.walletObj.address.trim().toLowerCase();

		//	...
		return this.walletObj;
	}

	/**
	 * 	get userId
	 * 	@returns {number}
	 */
	public getUserId() : number
	{
		try
		{
			const tmp = localStorage.getItem( `current.userId` );
			if ( _.isString( tmp ) && ! _.isEmpty( tmp ) )
			{
				return parseInt( tmp );
			}
		}
		catch ( err )
		{
			console.error( `${ this.constructor.name }.getUserId :: failed to get userId : `, err );
		}

		//	default to 1
		return 1;
	}

	/**
	 * 	get current username
	 * 	@returns {string | null}
	 */
	public getUserName() : string | null
	{
		try
		{
			const tmp = localStorage.getItem( `current.userName` );
			return tmp ? tmp : null;
		}
		catch ( err )
		{
			console.error( `${ this.constructor.name }.getUserName :: failed to get userName : `, err );
		}

		return null;
	}

	/**
	 * 	get current mnemonic
	 * 	@returns {string | null}
	 */
	public getMnemonic() : string | null
	{
		try
		{
			const tmp = localStorage.getItem( `current.mnemonic` );
			return tmp ? tmp : null;
		}
		catch ( err )
		{
			console.error( `${ this.constructor.name }.getMnemonic :: failed to get mnemonic : `, err );
		}

		return null;
	}
}
