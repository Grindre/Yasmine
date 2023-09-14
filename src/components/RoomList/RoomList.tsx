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
	private userService = new UserService()