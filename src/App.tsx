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