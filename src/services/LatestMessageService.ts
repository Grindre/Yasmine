import { ChatRoomEntityItem } from "debeem-chat-client";
import {
	ChatMessage,
	ChatRoomEntityUnreadItem, ClientConnect,
	ClientRoom,
	ClientRoomLatestMessage,
	VaChatRoomEntityItem, VaSendMessageRequest
} from "debeem-chat-client";
import _ from "lodash";
import { CountMessageRequest } from "debeem-chat-client";
import { LatestMessageUtil } from "../utils/LatestMessageUtil";
import { UserService } from "./UserService";

/**
 * 	@class LatestMessageService
 */
export class LatestMessageService
{
	private clientConnect ! : ClientConnect;

	private userService = new UserService();
	private clientRoom = new ClientRoom();
	private clientRoomLatestMessage = new ClientRoomLatestMessage();

	constructor( clientConnect : ClientConnect )
	{
		this.clientConnect = clientConnect;
	}


	/**
	 * 	try to query the number of unread messages for room
	 *	@returns {Promise<boolean>}
	 */
	public countMessage( roomId ?: string ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( ! this.clientConnect )
				{
					return reject( `${ this.constructor.name }.countMessage :: invalid walletObj null` );
				}

				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					return reject( `${ this.constructor.name }.countMessage :: invalid walletObj null` );
				}

				let rooms : Array<ChatRoomEntityItem> = [];
				if ( roomId &&
					null === VaChatRoomEntityItem.isValidRoomId( roomId ) )
				{
					//
					//	query the specified room
					//
					const roomItem : ChatRoomEntityItem | null = await this.clientRoom.queryRoom( walletObj.address, roomId );
					if ( ! roomItem )
					{
						return reject( `${ this.constructor.name }.countMessage :: room(${ roomId }) not found` );
					}
					rooms.push( roomItem );
				}
				else
				{
					//
					//	query all rooms
					//
					rooms = await this.clientRoom.queryRooms( walletObj.address );
				}
				if ( ! Array.isArray( rooms ) )
				{
					return resolve( false );
				}

				let queryOptions : Array<any> = [];
				for ( const room of rooms )
				{
					const errorRoom = VaChatRoomEntityItem.validateChatRoomEntityItem( room );
					if ( null !== errorRoom )
					{
						continue;
					}

					const latestTimestamp : number | undefined = _.isNumber( room?.latestMessage?.timestamp ) ? room?.latestMessage?.timestamp : 0;
					queryOptions.push( {
						channel : room.roomId,
						startTimestamp : latestTimestamp,
						lastElement : 3,
					} )
				}

				const countMessageRequest : CountMessageRequest = {
					options : queryOptions
				};
				console.log( `${ this.constructor.name }.countMessage :: 🍄 countMessageRequest: `, countMessageRequest );
				this.clientConnect.countMessage( countMessageRequest, async ( response : any ) =>
				{
					console.log( `${ this.constructor.name }.countMessage :: 🍄 response: `, response );
					await this.storeUnread( response );

					//	...
					resolve( true );
				} );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	try to save latest message and unread count to the local database
	 *	@param response		{any}
	 *	@returns {Promise<boolean>}
	 */
	public storeUnread( response : any ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					return reject( `${ this.constructor.name }.storeUnread :: invalid walletObj null` );
				}

				const unreadList : Array<ChatRoomEntityUnreadItem> = LatestMessageUtil.parseChatRoomEntityUnreadItem( response );
				if ( Array.isArray( unreadList ) )
				{
					for ( let unreadItem of unreadList )
					{
						if ( ! unreadItem )
						{
							continue;
						}

						if ( unreadItem.unreadCount > 0 )
						{
							unreadItem.unreadCount --;
						}

						console.log( `${ this.constructor.name }.storeUnread :: clientRoomLatestMessage.updateUnread for ${ walletObj.address }.${ unreadItem.roomId }` );
						await this.clientRoomLatestMessage.updateUnread( walletObj.address, unreadItem.roomId, unreadItem );
					}
				}

				return resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	/**
	 * 	store latest message
	 *	@param roomId		{string}
	 *	@param chatMessage	{ChatMessage}
	 *	@returns {Promise<boolean>}
	 */
	public storeLatestMessage( roomId : string, chatMessage : ChatMessage ) : Promise<boolean>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					return reject( `${ this.constructor.name }.storeLatestMessage :: invalid walletObj null` );
				}

				if ( null !== VaChatRoomEntityItem.isValidRoomId( roomId ) )
				{
					return reject( `${ this.constructor.name }.storeLatestMessage :: invalid roomId` );
				}
				if ( null !== VaSendMessageRequest.validateSendMessageRequest({ payload: chatMessage } ) )
				{
					return reject( `${ this.constructor.name }.storeLatestMessage :: invalid chatMessage` );
				}

				console.log( `${ this.constructor.name }.storeLatestMessage :: 🌈🌈🌈 will clientRoomLatestMessage.updateLatestMessage for ${ walletObj.address }.${ roomId }` );

				//	...
				let storeLatestMessage : ChatMessage | null = await this.clientRoomLatestMessage.queryLatestMessage( walletObj.address, roomId );
				if ( ! storeLatestMessage ||
					chatMessage.timestamp > storeLatestMessage.timestamp )
				{
					await this.clientRoomLatestMessage.updateLatestMessage( walletObj.address, roomId, chatMessage );
				}

				//	...
				return resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}
}
