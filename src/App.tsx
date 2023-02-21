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

export class App 