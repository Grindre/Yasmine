
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