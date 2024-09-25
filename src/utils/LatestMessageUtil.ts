
import { ChatRoomEntityUnreadItem, VaChatRoomEntityItem, VaSendMessageRequest } from 'debeem-chat-client';
import { TypeUtil } from "debeem-utils";
import _ from "lodash";
import { ChatMessage, MessageType } from "debeem-chat-client";

/**
 * 	@class	LatestMessageUtil
 */
export class LatestMessageUtil
{
	/**
	 *	@param response		{any}
	 *	@returns {Array<ChatRoomEntityUnreadItem>}
	 */
	public static parseChatRoomEntityUnreadItem( response : any ) : Array<ChatRoomEntityUnreadItem>
	{
		if ( ! TypeUtil.isNotNullObjectWithKeys( response, [ 'status', 'list' ] ) )
		{