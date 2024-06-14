
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