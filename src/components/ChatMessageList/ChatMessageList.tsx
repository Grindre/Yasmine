
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

	userService ! : UserService;
	messageService ! : MessageService;
	latestMessageService ! : LatestMessageService;

	/**
	 * 	...
	 */
	clientConnect ! : ClientConnect;
	clientRoom ! : ClientRoom;
	clientRoomLatestMessage ! : ClientRoomLatestMessage;

	chatMessageList : Array<ChatMessage> = [];
	oldestTimestamp : LastTimestamp = {};


	constructor( props : any )
	{
		if ( ! _.isString( props.serverUrl ) || _.isEmpty( props.serverUrl ) )
		{
			throw new Error( `invalid serverUrl` );
		}
		if ( ! _.isFunction( props.callbackOnMessageArrived ) )
		{
			throw new Error( `invalid props.callbackOnMessageArrived` );
		}

		//	...
		super( props );
		this.state = {
			isPageActive : false,
			serverUrl : props.serverUrl,
			roomId : ``,
			roomItem : {} as ChatRoomEntityItem,
			userId : 1,

			messages : [],
			loading : false,
			value : ''