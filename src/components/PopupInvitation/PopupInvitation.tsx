
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
		} );

		console.log( `🌼 show : ${ this.state.showPopup }, will create invitation for roomId : ${ roomId }` );
		if ( roomId && null === VaChatRoomEntityItem.isValidRoomId( roomId ) )
		{
			this.asyncCreateInvitation( roomId ).then( ( res : InviteRequest ) =>
			{
				const json : string = JSON.stringify( res );
				this.setState( {
					textareaValue : json
				} );

			} ).catch( err =>
			{
				console.error( err );
			} );
		}
	}

	private asyncCreateInvitation( roomId : string ) : Promise<InviteRequest>
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				if ( null !== VaChatRoomEntityItem.isValidRoomId( roomId ) )
				{
					return reject( `invalid roomId` );
				}

				//	get current wallet
				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					window.alert( `failed to create walletObj` );
					return ;
				}

				const inviteRequest : InviteRequest | null = await this.clientRoom.inviteMember( walletObj.address, roomId );
				if ( null === inviteRequest )
				{
					return reject( `failed to create invitation` );
				}

				//	...
				resolve( inviteRequest );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	onClickCopyToClipboard()
	{
		if ( navigator.clipboard )
		{
			// 通过 Clipboard API 复制内容
			navigator.clipboard.writeText( this.refTextarea.current.value )
				.then( () =>
				{
					this.refTextarea.current.select();
					console.log( '文本已成功复制到剪切板' );
				} )
				.catch( ( err ) =>
				{
					console.error( '复制到剪切板时出错:', err );
				} );
		}
		else
		{
			// 如果不支持 Clipboard API，则回退到使用 document.execCommand 方法
			this.refTextarea.current.select();
			document.execCommand( 'copy' );
			console.log( '文本已成功复制到剪切板' );
		}
	}

	render()
	{
		return (
			<div className="container">