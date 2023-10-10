import { ChatRoomMemberType, ChatType, ClientRoom } from "debeem-chat-client";
import React from "react";
import { ChatRoomEntityItem } from "debeem-chat-client";
import { PopupCreateRoom } from "../PopupCreateRoom/PopupCreateRoom";
import { CreateChatRoom } from "debeem-chat-client";
import classnames from "classnames";
import "./RoomList.css";
import _ from "lodash";
import { PopupJoin } from "../PopupJoin/PopupJoin";
import { PopupMemberList } from "../PopupMemberList/PopupMemberList";
import { UserService } from "../../services/UserService";

export interface ChatRoomListProps
{
	callbackOnRoomChanged : ( roomId : string ) => void;
}

export interface ChatRoomListState
{
	loading : boolean;
	showPopupCreateRoom : boolean;
	rooms : Array<ChatRoomEntityItem>
	currentRoomId : string;
}

/**
 * 	@class
 */
export class RoomList extends React.Component<ChatRoomListProps, ChatRoomListState>
{
	private userService = new UserService();
	private initialized : boolean = false;
	private clientRoom ! : ClientRoom;
	refPopupCreateRoom : React.RefObject<any>;
	refPopupJoinRoom : React.RefObject<any>;
	refPopupMemberList : React.RefObject<any>;


	constructor( props : any )
	{
		if ( ! _.isFunction( props.callbackOnRoomChanged ) )
		{
			throw new Error( `invalid props.callbackOnRoomChanged` );
		}

		super( props );
		this.state = {
			loading : true,
			showPopupCreateRoom : false,
			rooms : [],
			currentRoomId : '',
		};

		this.clientRoom = new ClientRoom();
		this.refPopupCreateRoom = React.createRef();
		this.refPopupJoinRoom = React.createRef();
		this.refPopupMemberList = React.createRef();

		this.onClickCreateRoom = this.onClickCreateRoom.bind( this );
		this.onClickJoinRoom = this.onClickJoinRoom.bind( this );
		this.onClickRoomItem = this.onClickRoomItem.bind( this );
		this.onClickPopupMemberList = this.onClickPopupMemberList.bind( this );
		this.onClickDeleteRoom = this.onClickDeleteRoom.bind( this );

		this.callbackPopupCreateRoom = this.callbackPopupCreateR