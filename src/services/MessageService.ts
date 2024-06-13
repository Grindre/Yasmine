
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
