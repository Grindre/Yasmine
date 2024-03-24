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
	private clientConnect ! 