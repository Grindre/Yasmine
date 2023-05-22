
import {
	ChatMessage, ClientConnect,
	ClientReceiveMessageCallback,
	ClientRoom,
	ClientRoomLatestMessage,
	JoinRoomRequest,
	LeaveRoomRequest,
	LeaveRoomResponse,
	MessageType,
	ResponseCallback,
	SendMessageRequest,
	VaChatRoomEntityItem
} from "debeem-chat-client";
import React from "react";
import _ from "lodash";
import "./ChatMessageList.css";
import { PopupInvitation } from "../PopupInvitation/PopupInvitation";
import { ChatRoomEntityItem } from "debeem-chat-client";
import { UserService } from "../../services/UserService";
import { LatestMessageService } from "../../services/LatestMessageService";
import { MessageService } from "../../services/MessageService";
import { DecryptedMessageList } from "../../models/DecryptedMessageList";


export interface LastTimestamp
{
	//
	//	key : roomId
	//	value : timestamp
	//
	[ key : string ] : number;
}

export interface ChatMessageListProps
{
	serverUrl : string;
	callbackOnMessageArrived : () => void;
}

export interface ChatMessageListState
{
	isPageActive : boolean;

	serverUrl : string;
	roomId : string;
	roomItem : ChatRoomEntityItem;
	userId : number;	//	current user id

	loading : boolean;
	value : string;
	messages : Array<ChatMessage>;
}

/**
 * 	@class
 */
export class ChatMessageList extends React.Component<ChatMessageListProps, ChatMessageListState>
{
	initialized : boolean = false;
	messagesEnd : any = null;

	refPopupInvitation : React.RefObject<any>;
	refPopupJoin : React.RefObject<any>;
