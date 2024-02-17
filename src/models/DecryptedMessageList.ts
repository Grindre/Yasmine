
import { ChatMessage } from "debeem-chat-client";

export interface DecryptedMessageList
{
	/**
	 * 	the oldest one
	 */
	oldest	: ChatMessage;

	/**
	 * 	the latest one
	 */
	latest	: ChatMessage;

	/**
	 * 	the full list
	 */
	list	: Array<ChatMessage>;
}