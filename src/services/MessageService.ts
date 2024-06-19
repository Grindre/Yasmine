
import { ChatRoomEntityItem, ChatRoomMemberType } from "debeem-chat-client";
import {
	ChatMessage,
	ChatRoomMember,
	ChatType,
	ClientConnect,
	ClientRoom,
	GroupMessageCrypto, MessageType,
	PaginationOrder,
	PrivateMessageCrypto,
	PullMessageRequest,
	PullMessageResponse, ResponseCallback,
	SendMessageRequest,
	VaChatRoomEntityItem,
	VaSendMessageRequest
} from "debeem-chat-client";
import _ from "lodash";
import { UserService } from "./UserService";
import { PageUtil } from "debeem-utils";
import { DecryptedMessageList } from "../models/DecryptedMessageList";

/**
 * 	@class LatestMessageService
 */
export class MessageService
{
	private clientConnect ! : ClientConnect;

	private userService = new UserService();
	private clientRoom = new ClientRoom();

	constructor( clientConnect : ClientConnect )
	{
		this.clientConnect = clientConnect;
	}

	/**
	 * 	pull messages from server
	 *	@param roomId		{string}
	 *	@param startTimestamp	{number}
	 *	@param endTimestamp	{number}
	 *	@param pageNo		{number}
	 *	@param pageSize		{number}
	 *	@returns {Promise<Array<SendMessageRequest>>}
	 */
	public pullMessage(
		roomId : string,
		startTimestamp ? : number,
		endTimestamp ? : number,
		pageNo ? : number,
		pageSize ? : number ) : Promise<Array<SendMessageRequest>>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorRoomId : string | null = VaChatRoomEntityItem.isValidRoomId( roomId );
				if ( null !== errorRoomId )
				{
					return reject( `${ this.constructor.name }.pullMessage :: ${ errorRoomId }` );
				}

				this.clientConnect.pullMessage( {
					roomId : roomId,
					startTimestamp : _.isNumber( startTimestamp ) ? startTimestamp : 0,
					endTimestamp : _.isNumber( endTimestamp ) ? endTimestamp : -1,
					pagination : {
						pageNo : PageUtil.getSafePageNo( pageNo ),
						pageSize : PageUtil.getSafePageSize( pageSize ),
						order : PaginationOrder.DESC
					}
				} as PullMessageRequest, ( response : PullMessageResponse ) : void =>
				{
					console.log( `${ this.constructor.name }.pullMessage :: 🐹 pull data from the specified room and return the response: `, response );
					if ( ! _.isObject( response ) ||
						! _.has( response, 'status' ) ||
						! _.has( response, 'list' ) )
					{
						return reject( `${ this.constructor.name }.pullMessage :: invalid response` );
					}

					//	...
					let messageList : Array<SendMessageRequest> = [];
					if ( Array.isArray( response?.list ) &&
						response?.list?.length > 0 )
					{
						for ( const item of response.list )
						{
							if ( ! _.isObject( item ) || ! _.isObject( item.data ) )
							{
								continue;
							}
							if ( null !== VaSendMessageRequest.validateSendMessageRequest( item.data ) )
							{
								continue;
							}

							messageList.push( item.data );
						}
					}

					resolve( messageList );
				} );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 *	@param messageList	{Array<SendMessageRequest>}
	 *	@returns {Promise<DecryptedMessageList | null>}
	 */
	public decryptMessageList( messageList : Array<SendMessageRequest> ) : Promise<DecryptedMessageList | null>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! Array.isArray( messageList ) || 0 === messageList.length )
				{
					return resolve( null );
					//return reject( `${ this.constructor.name }.decryptMessageList :: invalid messageList` );
				}

				const decryptedMessageList : Array<ChatMessage> = [];
				for ( const message of messageList )
				{
					if ( null !== VaSendMessageRequest.validateSendMessageRequest( message ) )
					{
						continue;
					}

					//	decrypted message
					const decryptedMessage : SendMessageRequest = await this.decryptMessage( message );
					decryptedMessageList.push( decryptedMessage.payload );
				}
				if ( 0 === decryptedMessageList.length )
				{
					return resolve( null );
				}

				/**
				 * 	sort the decrypted message list by .timestamp ASC
				 */
				decryptedMessageList.sort( ( a : ChatMessage, b : ChatMessage ) => a.timestamp - b.timestamp );

				//	...
				resolve({
					oldest	: decryptedMessageList[ 0 ],
					latest	: decryptedMessageList[ decryptedMessageList.length - 1 ],
					list	: decryptedMessageList
				});
			}
			catch ( err )
			{
				reject( err );
			}
		});
	}

	/**
	 *	@param message		{SendMessageRequest}
	 *	@returns {SendMessageRequest}
	 */
	public decryptMessage( message : SendMessageRequest ) : Promise<SendMessageRequest>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( null !== VaSendMessageRequest.validateSendMessageRequest( message ) )
				{
					return reject( `${ this.constructor.name }.decryptMessage :: invalid message` );
				}

				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					return reject( `${ this.constructor.name }.decryptMessage :: wallet not initialized` );
				}

				const roomItem : ChatRoomEntityItem | null = await this.clientRoom.queryRoom( walletObj.address, message.payload.roomId );
				if ( ! roomItem )
				{
					return reject( `${ this.constructor.name }.decryptMessage :: room not ready` );
				}

				//console.log( `🌷 this roomItem :`, roomItem );
				//console.log( `🌷 message :`, message );