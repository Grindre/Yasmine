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
					return re