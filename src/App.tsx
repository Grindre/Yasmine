import React from 'react';
import './App.css';
import { ChatMessageList } from "./components/ChatMessageList/ChatMessageList";
import { RoomList } from "./components/RoomList/RoomList";
import { UserService } from "./services/UserService";


export interface AppProps
{
}

export interface AppState
{
	selectedUserId : number;
	selectedServer : string;
}

export const defaultServer = 'localhost:6616';

export class App extends React.Component<AppProps, AppState>
{
	private userService = new UserService();

	refRoomList : React.RefObject<any>;
	refChatMessageList : React.RefObject<any>;

	constructor( props : any )
	{
		super( props );
		this.state = {
			selectedUserId : 1,
			selectedServer : this.loadServerAddress(),
		};

		//	...
		this.refRoomList = React.createRef();
		this.refChatMessageList = React.createRef();

		//	...
		this.onSwitchRoom = this.onSwitchRoom.bind( this );
		this.onNewMessageArrived = this.onNewMessageArrived.bind( this );
		this.onSelectServerChanged = this.onSelectServerChanged.bind( this );
		this.onSelectUserChanged = this.onSelectUserChanged.bind( this );
	}

	componentDidMount()
	{
		this.initSelectedServer();
		this.initSelectedUser();
	}


	public loadServerAddress() : string
	{
		return localStorage.getItem( `current.server` ) || defaultServer;
	}
	private initSelectedServer()
	{
		let server : string = this.loadServerAddress();

		console.log( `initSelectedServer server :`, server );
		this.setState({
			selectedServer : server,
		});
	}

	private initSelectedUser()
	{
		const userId : number = this.userService.getUserId();
		console.log( `initSelectedUser userId :`, userId );
		this.setState({
			selectedUserId : userId,
		});
	}

	onSwitchRoom( roomId : string )
	{
		console.log( `🐹🐹🐹 App::onRoomChanged :`, roomId );

		const childInstance = this.refChatMessageList.current;
		childInstance.asyncLoad( roomId ).then( ( res : boolean ) =>
		{
			console.log( `App::onRoomChanged ChatMessageList.asyncLoad :`, res );
		}).catch( ( err : any ) =>
		{
			console.error( `App::onRoomChanged err: `, err );
		})
	}

	onNewMessageArrived()
	{
		console.log( `🍆🍆🍆 App::onNewMessageArrived ${ new Date().toLocaleString() }` );
		const childInstance = this.refRoomList.current;
		childInstance.loadRooms();
	}

	onSelectServerChanged( e : any )
	{
		const server : string = String( e.target.value );
		this.setState({
			selectedServer : server,
		});

		//	save to localStorage
		localStorage.setItem( `current.server`, server );

		setTimeout( () =>
		{
			window.location.reload();

		}, 300 );
	}

	onSelectUserChanged( e : any )
	{
		const userId : number = parseInt( e.target.value );
		this.setState({
			selectedUserId : userId,
		});

		//	...
		const childChatMessageList = this.refChatMessageList.current;
		childChatMessageList.setUser( userId );

		setTimeout( () =>
		{
			//	...
			const childRoomList =