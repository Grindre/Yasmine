
import React, { Component } from "react";
import { PopupComponent } from "../PopupComponent/PopupComponent";
import "./PopupInvitation.css";
import { ClientRoom, InviteRequest, VaChatRoomEntityItem } from "debeem-chat-client";
import { UserService } from "../../services/UserService";


export interface PopupInvitationProps
{
}

export interface PopupInvitationState
{
	showPopup : boolean;
	textareaValue : string;
}

export class PopupInvitation extends Component<PopupInvitationProps, PopupInvitationState>
{
	private userService = new UserService();
	clientRoom : ClientRoom = new ClientRoom();
	refTextarea : React.RefObject<any>;

	constructor( props : any )
	{
		super( props );
		this.state = {
			showPopup : false,
			textareaValue : '',
		};

		//	...
		this.refTextarea = React.createRef();

		//	...
		this.togglePopup = this.togglePopup.bind( this );
		this.onClickCopyToClipboard = this.onClickCopyToClipboard.bind( this );
	}

	public togglePopup( roomId ? : string )
	{
		this.setState( {
			showPopup : ! this.state.showPopup,