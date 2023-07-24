
import React, { Component } from "react";
import { PopupComponent } from "../PopupComponent/PopupComponent";
import "./PopupJoin.css";
import {
	ChatRoomMember,
	ChatRoomMemberType,
	ClientRoom,
	InviteRequest,
	VaChatRoomEntityItem
} from "debeem-chat-client";
import { ChatRoomEntityItem } from "debeem-chat-client";
import _ from "lodash";
import { UserService } from "../../services/UserService";


export type PopupJoinCallback = ( data : any ) => void;

export interface PopupJoinProps
{
	callback : PopupJoinCallback;
}

export interface PopupJoinState
{
	showPopup : boolean;
	textareaValue : string;
}

export class PopupJoin extends Component<PopupJoinProps, PopupJoinState>
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
		this.onClickSaveJoin = this.onClickSaveJoin.bind( this );
	}

	public togglePopup()
	{
		this.setState( {
			showPopup : ! this.state.showPopup,
		} );
	}

	private asyncCreateInvitation( roomId : string ) : Promise<InviteRequest>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				//	get current wallet
				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					window.alert( `failed to create walletObj` );