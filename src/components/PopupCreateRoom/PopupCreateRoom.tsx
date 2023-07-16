
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
