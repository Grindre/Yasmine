
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