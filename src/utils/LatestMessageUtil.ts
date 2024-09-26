
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
			return [];
			//throw new Error( `parseChatRoomEntityUnreadItem :: invalid response` );
		}
		if ( ! _.isNumber( response.status ) ||
			response.status < 200 ||
			response.status > 208 )
		{
			return [];
			//throw new Error( `parseChatRoomEntityUnreadItem :: invalid response.status` );
		}
		if ( ! Array.isArray( response.list ) || 0 === response.list.length )
		{
			return [];
			//throw new Error( `parseChatRoomEntityUnreadItem :: invalid response.list` );
		}

		let unreadItems : Array<ChatRoomEntityUnreadItem> = [];
		for ( const item of response.list )
		{
			if ( ! TypeUtil.isNotNullObjectWithKeys( item, [ 'channel', 'count', 'lastElementList' ] ) )
			{
				continue;
			}
			if ( null !== VaChatRoomEntityItem.isValidRoomId( item.channel ) )
			{
				continue;
			}
			if ( ! _.isNumber( item.count ) || item.count < 0 )
			{
				continue;
			}

			//	get latest user message
			let latestMessage : ChatMessage | null = null;
			if ( Array.isArray( item.lastElementList ) )
			{
				for ( const element of item.lastElementList )
				{
					if ( null !== VaSendMessageRequest.validateSendMessageRequest( element?.data ) )
					{
						continue;
					}

					const chatMessage : ChatMessage = element?.data?.payload;
					if ( ! chatMessage
						|| MessageType.USER !== chatMessage.messageType )
					{
						//	extract only user type messages
						continue;
					}

					if ( null == latestMessage ||
						chatMessage.timestamp > latestMessage.timestamp )
					{
						latestMessage = chatMessage;
					}
				}
			}

			unreadItems.push({
				roomId: item.channel,
				unreadCount: item.count,
				unreadLatestMessage: latestMessage ? latestMessage : undefined
			})
		}

		return unreadItems;
	}
}