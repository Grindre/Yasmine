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
						la