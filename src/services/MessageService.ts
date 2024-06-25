
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

				if ( roomItem.chatType !== message.payload.chatType )
				{
					return reject( `${ this.constructor.name }.decryptMessage :: chatType does not match` );
				}

				//	...
				if ( ChatType.PRIVATE === roomItem.chatType )
				{
					const messageMember : ChatRoomMember = {
						memberType : ChatRoomMemberType.MEMBER,
						wallet : String( message.payload.wallet ).trim().toLowerCase(),
						publicKey : message.payload.publicKey,
						userName : message.payload.fromName,
						userAvatar : message.payload.fromAvatar,
						timestamp : message.payload.timestamp,
					};
					const tryRoomItem : ChatRoomEntityItem = _.cloneDeep( roomItem );
					tryRoomItem.members[ messageMember.wallet ] = messageMember;

					//console.log( `🌷 tryRoomItem :`, tryRoomItem );

					const decryptedBody = await new PrivateMessageCrypto().decryptMessage(
						message.payload.body,
						tryRoomItem,
						walletObj.address,
						walletObj.privateKey
					);
					//console.log( `🌷 decryptedBody :`, decryptedBody );
					if ( this.isValidDecryptedBody( message, decryptedBody ) )
					{
						//	decrypt successfully, tries to save the member
						try
						{
							await this.clientRoom.putMember( walletObj.address, roomItem.roomId, messageMember );
						}
						catch ( err )
						{
						}
					}
					message.payload.body = decryptedBody;
				}
				else if ( ChatType.GROUP === roomItem.chatType )
				{
					const messageMember : ChatRoomMember = {
						memberType : ChatRoomMemberType.MEMBER,
						wallet : String( message.payload.wallet ).trim().toLowerCase(),
						publicKey : message.payload.publicKey,
						userName : message.payload.fromName,
						userAvatar : message.payload.fromAvatar,
						timestamp : message.payload.timestamp,
					};
					const decryptedBody = await new GroupMessageCrypto().decryptMessage( message.payload.body, roomItem, `` );
					//console.log( `🌷 decryptedBody :`, decryptedBody );
					if ( this.isValidDecryptedBody( message, decryptedBody ) )
					{
						//	decrypt successfully, tries to save the member
						try
						{
							await this.clientRoom.putMember( walletObj.address, roomItem.roomId, messageMember );
						}
						catch ( err )
						{
						}
					}
					message.payload.body = decryptedBody;
				}

				resolve( message );
			}
			catch ( err )
			{
				console.error( `${ this.constructor.name }.decryptMessage :: 🔥 error:`, err );
				resolve( message );
			}
		} );
	}

	/**
	 *	@param message		{SendMessageRequest}
	 *	@param decryptedBody	{any}
	 *	@returns {boolean}
	 */
	public isValidDecryptedBody( message : SendMessageRequest, decryptedBody : any ) : boolean
	{
		if ( ! message )
		{
			return false;
		}

		return _.isString( decryptedBody ) && ! _.isEmpty( decryptedBody ) &&
			_.isString( message.payload.body ) && ! _.isEmpty( message.payload.body ) &&
			decryptedBody !== message.payload.body &&
			message.payload.body.length > decryptedBody.length;
	}

	/**
	 *	@param roomId		{string}
	 *	@param messageType	{MessageType}
	 *	@param messageBody	{any}
	 */
	public sendMessage( roomId : string, messageType : MessageType, messageBody : any ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const errorRoomId : string | null = VaChatRoomEntityItem.isValidRoomId( roomId );
				if ( null !== errorRoomId )
				{
					return reject( `${ this.constructor.name }.sendMessage :: ${ errorRoomId }` );
				}

				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					return reject( `${ this.constructor.name }.sendMessage :: wallet not initialized` );
				}

				const roomItem : ChatRoomEntityItem | null = await this.clientRoom.queryRoom( walletObj.address, roomId );
				if ( ! roomItem )
				{
					return reject( `${ this.constructor.name }.sendMessage :: room not ready` );
				}

				if ( null !== VaSendMessageRequest.isValidMessageType( messageType ) )
				{
					return reject( `${ this.constructor.name }.sendMessage :: invalid messageType` );
				}
				if ( ! _.isObject( messageBody ) &&
					! _.isString( messageBody ) &&
					! _.isNumber( messageBody ) )
				{
					return reject( `${ this.constructor.name }.sendMessage :: invalid messageBody` );
				}

				const pinCode = ``;
				const userName = this.userService.getUserName() ?? `[Anonymous]`;
				const callback : ResponseCallback = ( response : any ) : void =>
				{
					console.log( `${ this.constructor.name }.sendMessage :: 🍔 send message response: `, response );
				};
				const publicKey : string | undefined = ( ChatType.PRIVATE === roomItem.chatType ) ? walletObj.publicKey : undefined;
				const body : string = _.isObject( messageBody ) ? JSON.stringify( messageBody ) : String( messageBody );
				let chatMessage : ChatMessage = {
					roomId : roomId,			//	messages will be sent to this chat room
					chatType : roomItem.chatType,		//	private or group
					messageType : messageType,		//	user message. added @2024-04-05
					wallet : walletObj.address,		//	person who sent the message
					publicKey : publicKey,
					fromName : userName,
					fromAvatar : `https://www.avatar.com/aaa.jgp`,
					body : body,					//	message body
					timestamp : new Date().getTime(),
					hash : '',
					sig : '',
				};

				if ( ChatType.PRIVATE === roomItem.chatType )
				{
					console.log( `${ this.constructor.name }.sendMessage :: will send private message: `, chatMessage );
					this.clientConnect.sendPrivateMessage( walletObj.privateKey, chatMessage, callback );
				}
				else if ( ChatType.GROUP === roomItem.chatType )
				{
					console.log( `${ this.constructor.name }.sendMessage :: will send group message: `, chatMessage );
					this.clientConnect.sendGroupMessage( walletObj.privateKey, chatMessage, pinCode, callback );
				}

				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}