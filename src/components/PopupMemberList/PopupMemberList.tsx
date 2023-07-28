
import React, { Component } from "react";
import { PopupComponent } from "../PopupComponent/PopupComponent";
import "./PopupMemberList.css";
import {
	ChatRoomMember,
	ChatRoomMemberType, ChatType,
	ClientRoom,
	VaChatRoomEntityItem
} from "debeem-chat-client";
import { ChatRoomEntityItem, ChatRoomMembers } from "debeem-chat-client";
import _ from "lodash";
import { UserService } from "../../services/UserService";


export type PopupMemberListCallback = ( data : any ) => void;

export interface PopupMemberListProps
{
	callback : PopupMemberListCallback;
}

export interface PopupMemberListState
{
	showPopup : boolean;
	roomMembers : Array<ChatRoomMember>
}

export class PopupMemberList extends Component<PopupMemberListProps, PopupMemberListState>
{
	private userService : UserService = new UserService();
	private clientRoom : ClientRoom = new ClientRoom();
	private roomItem !: ChatRoomEntityItem;

	constructor( props : any )
	{
		super( props );
		this.state = {
			showPopup : false,
			roomMembers : [],
		};