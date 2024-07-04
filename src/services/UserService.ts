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
	private walletObj : TWallet