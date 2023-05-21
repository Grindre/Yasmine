
import {
	ChatMessage, ClientConnect,
	ClientReceiveMessageCallback,
	ClientRoom,
	ClientRoomLatestMessage,
	JoinRoomRequest,
	LeaveRoomRequest,
	LeaveRoomResponse,
	MessageType,
	ResponseCallback,
	SendMessageRequest,
	VaChatRoomEntityItem
} from "debeem-chat-client";
import React from "react";
import _ from "lodash";
import "./ChatMessageList.css";
import { PopupInvitation } from "../PopupInvitation/PopupInvitation";
import { ChatRoomEntityItem } from "debeem-chat-client";
import { UserService } from "../../services/UserService";
import { LatestMessageService } from "../../services/LatestMessageService";