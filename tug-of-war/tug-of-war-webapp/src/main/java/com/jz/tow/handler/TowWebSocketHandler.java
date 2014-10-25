package com.jz.tow.handler;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jz.tow.OpCodes;
import com.jz.tow.WSMessage;
import com.jz.tow.manager.TowManager;

@Component
public class TowWebSocketHandler extends TextWebSocketHandler {
	private Logger logger = LoggerFactory.getLogger(TowWebSocketHandler.class);

	@Autowired
	private TowManager towManager;

	@Autowired
	@Qualifier("objectMapper")
	private ObjectMapper objectMapper;
	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		super.afterConnectionEstablished(session);
		this.towManager.handleNewConnection(session);
	}
	
	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		super.afterConnectionClosed(session, status);
		this.towManager.handleClosedConnection(session);
	}

	@Override
	public void handleTextMessage(WebSocketSession session, TextMessage message) {
		try {
			WSMessage wsMessage = this.objectMapper.readValue(message.getPayload(), WSMessage.class);
			
			if (wsMessage.getOp() == OpCodes.START_GAME) {
				this.towManager.startGame(session);
			} else if (wsMessage.getOp() == OpCodes.UPDATE_ROPE) {
				this.towManager.tug(session, wsMessage);
			}
		} catch (JsonProcessingException e) {
			this.logger.error("startGame", e);
		} catch (IOException e) {
			this.logger.error("startGame", e);
		}
	}
}