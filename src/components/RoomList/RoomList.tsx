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

		this.callbackPopupCreateRoom = this.callbackPopupCreateRoom.bind( this );
		this.callbackPopupJoin = this.callbackPopupJoin.bind( this );
		this.callbackPopupMemberList = this.callbackPopupMemberList.bind( this );
	}

	componentDidUpdate()
	{
	}

	componentDidMount()
	{
		if ( this.initialized )
		{
			console.log( `🍔 componentDidMount, already initialized` );
			return;
		}
		this.initialized = true;

		//	...
		console.log( `🍔 componentDidMount` );
		this.loadRooms();
	}

	public loadRooms()
	{
		console.log( `🚚🚚🚚 will loadRooms` );
		this._asyncLoadRooms().then( _res =>
		{
			setTimeout( () =>
			{
				this.setState( { loading : false } );

			}, 1000 );
		} ).catch( _err =>
		{
			setTimeout( () =>
			{
				this.setState( { loading : false } );

			}, 1000 );
		} );
	}

	private _asyncLoadRooms()
	{
		return new Promise( async ( resolve, reject ) =>
		{
			try
			{
				const walletObj = this.userService.getWallet();
				if ( ! walletObj )
				{
					return reject( `_asyncLoadRooms :: failed to get wallet object` );
				}

				const rooms : Array<ChatRoomEntityItem> = await this.clientRoom.queryRooms( walletObj.address );
				console.log( `rooms :`, rooms );
				this.setState( {
					rooms : rooms,
				} );

				//	...
				resolve( true );
			}
			catch ( err )
			{
				reject( err );
			}
		} );
	}

	onClickCreateRoom()
	{
		const childInstance = this.refPopupCreateRoom.current;
		childInstance.togglePopup();
	}

	onClickJoinRoom()
	{
		const childInstance = this.refPopupJoinRoom.current;
		childInstance.togglePopup();
	}

	callbackPopupJoin( _data : any )
	{
		this.onClickJoinRoom();
		this.loadRooms();
	}

	callbackPopupCreateRoom( data : any )
	{
		console.log( `callbackPopupCreateRoom :`, data );

		const walletObj = this.userService.getWallet();
		if ( ! walletObj )
		{
			throw new Error( `callbackPopupCreateRoom :: failed to get wallet object` );
		}

		//	todo
		//	userService.getUserName;
		const userName : string | null = this.userService.getUserName();

		console.log( `onClickSaveJoin - walletObj :`, walletObj );
		const createChatRoomOptions : CreateChatRoom = {
			wallet : walletObj.address,
			chatType : data.chatType,
			name : data.name,
			members : {
				[ walletObj.address ] : {
					memberType : ChatRoomMemberType.OWNER,
					wallet : walletObj.address,
					publicKey : walletObj.publicKey,
					userName : String( userName ),
					userAvatar : 'https://www.aaa/avatar.png',
					timestamp : new Date().getTime()
				}
			}
		};
		this.clientRoom.createRoom( createChatRoomOptions ).then( response =>
		{
			console.log( `callbackPopupCreateRoom response :`, response );
			window.alert( `Room ${ data.name } was created!` );

			this.onClickCreateRoom();
			this.loadRooms();

		} ).catch( err =>
		{
			console.log( err );
		} );
	}

	onClickRoomItem( roomId : string )
	{
		console.log( `clicked :`, roomId );
		this.setState( {
			currentRoomId : roomId
		} );
		this.props.callbackOnRoomChanged( roomId );
	}


	callbackPopupMemberList( data : any )
	{
		this.loadRooms();
	}
	onClickPopupMemberList( roomId : string )
	{
		const childInstance = this.refPopupMemberList.current;
		childInstance.togglePopup();
		childInstance.loadMembers( roomId );
	}
	onClickDeleteRoom( roomId : string )
	{
		if ( window.confirm( `Are you sure you want to delete this room?` ) )
		{
			const walletObj = this.userService.getWallet();
			if ( ! walletObj )
			{
				throw new Error( `onClickDeleteRoom :: failed to get wallet` );
			}

			this.clientRoom.deleteRoom( walletObj.address, roomId ).then( deleted =>
			{
				window.alert( `room was deleted` );
				this.loadRooms();

			} ).catch( err =>
			{
				window.alert( err );
			} );
		}
	}


	render()
	{
		return (
			<div className="RoomListDiv">
				<div className="titleBar sticky-top">Room List</div>
				<div className="panel">
					{ this.state.loading ? (
						<div>Loading ...</div>
					) : (
						<div>
							<button onClick={ this.onClickCreateRoom }>Create a room
							</button>
							<PopupCreateRoom
								ref={ this.refPopupCreateRoom }
								callback={ this.callbackPopupCreateRoom }
							></PopupCreateRoom>

							<button onClick={ this.onClickJoinRoom }>Join a room</button>
							<PopupJoin
								ref={ this.refPopupJoinRoom }
								callback={ this.callbackPopupJoin }
							></PopupJoin>
						</div>
					) }
				</div>
				<div className="listContainer">
					{ this.state.rooms.map( ( item : ChatRoomEntityItem ) =>
						<div key={ item.roomId }
						     data-id={ item.roomId }
						     className={ classnames( 'roomItem', { 'selected' : this.state.currentRoomId === item.roomId } ) }>
							<div className="roomInfoBox" onClick={ ( _e ) =>
							{
								this.onClickRoomItem( item.roomId );
							} }>
								<div className="roomName">
									{ ChatType.PRIVATE === item.chatType ? 'Private' : 'Group' }
									/
									{ item.name }({ Object.keys( item.members ).length })
								</div>
								<div className="roomId">{ item.roomId }</div>
								<div className="roomCreatedTime">{ new Date( item.timestamp ).toLocaleString() }</div>
							</div>
							<div className="roomUnread">{ item.unread?.unreadCount } unread</div>
							<div className="roomOptBox">
								<a onClick={ ( _e ) =>
								{
									this.onClickPopupMemberList( item.roomId );
								} }>Members</a>
								&nbsp;-&nbsp;
								<a onClick={ ( _e ) =>
								{
									this.onClickDeleteRoom( item.roomId );
								} }>Delete</a>
							</div>
						</div>
					) }
				</div>
				<div>
					<PopupMemberList
						ref={ this.refPopupMemberList }
						callback={ this.callbackPopupMemberList }
					/>
				</div>
			</div>
		);
	}
}
