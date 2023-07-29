
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

		//	...
		this.togglePopup = this.togglePopup.bind( this );
		this.onClickDeleteMember = this.onClickDeleteMember.bind( this );
	}

	public togglePopup()
	{
		this.setState( {
			showPopup : ! this.state.showPopup,
		} );
	}

	public loadMembers( roomId : string )
	{
		this.asyncLoadMembers( roomId ).then( ( members : ChatRoomMembers ) =>
		{
			if ( _.isObject( members ) )
			{
				const roomMembers = _.values( members );
				this.setState({
					roomMembers : roomMembers,
				});
			}

		}).catch( err =>
		{
			window.alert( err );
		});
	}

	private asyncLoadMembers( roomId : string ) : Promise<ChatRoomMembers>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const walletObject = this.userService.getWallet();
				if ( ! walletObject )
				{
					window.alert( `failed to create walletObj` );
					return reject( `failed to create walletObj` );
				}

				if ( null !== VaChatRoomEntityItem.isValidRoomId( roomId ) )
				{
					window.alert( `invalid roomId` );
					return reject( `invalid roomId` );
				}

				const roomItem : ChatRoomEntityItem | null = await this.clientRoom.queryRoom( walletObject.address, roomId );
				if ( ! _.isObject( roomItem ) )
				{
					window.alert( `room not found` );
					return reject( `room not found` );
				}
				this.roomItem = roomItem;

				//	...
				const chatRoomMembers : ChatRoomMembers = await this.clientRoom.queryMembers( walletObject.address, roomId );

				//	...
				resolve( chatRoomMembers );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	onClickDeleteMember( wallet : string )
	{
		const walletObject = this.userService.getWallet();
		if ( ! walletObject )
		{
			window.alert( `failed to get walletObj` );
			return;
		}

		if ( ! this.roomItem )
		{
			window.alert( `room not ready` );
			return;
		}
		if ( ChatType.PRIVATE === this.roomItem.chatType )
		{
			window.alert( `members in private chat room are not allowed to be deleted` );
			return;
		}

		this.clientRoom.getMember( walletObject.address, this.roomItem.roomId, wallet ).then( async ( member : ChatRoomMember | null ) =>
		{