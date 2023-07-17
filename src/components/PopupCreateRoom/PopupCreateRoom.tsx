
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
			<div className="container">
			{ this.state.showPopup &&
			<PopupComponent onClose={ this.togglePopup }>
				<div className="titleDiv">Create Chat Room</div>
				<table>
					<tbody>
					<tr>
						<td style={{ width : '40px' }}>Type</td>
						<td style={{ height : '24px' }}>
							<label>
								<input
									type="radio"
									value={ ChatType.PRIVATE }
									checked={this.state.selectedChatType === ChatType.PRIVATE }
									onChange={this.onChatTypeOptionChange}
								/>Private
							</label>
							&nbsp;&nbsp;
							<label>
								<input
									type="radio"
									value={ ChatType.GROUP }
									checked={this.state.selectedChatType === ChatType.GROUP }
									onChange={this.onChatTypeOptionChange}
								/>Group
							</label>
						</td>
					</tr>
					<tr>
						<td>Name</td>
						<td style={{ height : '24px' }}>
							<input type="text" ref={ this.refInputName } />
						</td>
					</tr>
					<tr>
						<td></td>
						<td style={{ height : '20px' }}>
						</td>
					</tr>
					<tr>
						<td></td>
						<td>