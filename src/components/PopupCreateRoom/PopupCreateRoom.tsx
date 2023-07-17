
import React, { Component } from "react";
import { PopupComponent } from "../PopupComponent/PopupComponent";
import "./PopupCreateRoom.css";
import { ChatType } from "debeem-chat-client";
import _ from "lodash";


export type PopupCreateRoomCallback = ( data : any ) => void;

export interface PopupCreateRoomProps
{
	// children : React.ReactNode;
	// onClose : () => void;
	callback : PopupCreateRoomCallback;
}
export interface PopupCreateRoomState
{
	showPopup : boolean;
	selectedChatType : number;
}

export class PopupCreateRoom extends Component<PopupCreateRoomProps,PopupCreateRoomState>
{
	refInputName : React.RefObject<any>;

	constructor( props : any )
	{
		super( props );
		this.state = {
			showPopup : false,
			selectedChatType : ChatType.PRIVATE,
		};

		this.refInputName = React.createRef();

		//	...
		this.togglePopup = this.togglePopup.bind( this );
		this.onChatTypeOptionChange = this.onChatTypeOptionChange.bind( this );
		this.onClickSubmit = this.onClickSubmit.bind( this );
	}

	public togglePopup()
	{
		this.setState( {
			showPopup : ! this.state.showPopup,
		} );
	}

	onChatTypeOptionChange( e : any )
	{
		this.setState({
			selectedChatType: parseInt( e.target.value ),
		});
	}

	onClickSubmit( _e : any )
	{
		if ( ! _.isFunction( this.props.callback ) )
		{
			throw new Error( `invalid this.props.callback` );
		}

		//	...
		const data = {
			chatType : this.state.selectedChatType,
			name : this.refInputName.current.value,
		};
		console.log( 'callback data:', data );
		this.props.callback( data );
	}

	render()
	{
		return (