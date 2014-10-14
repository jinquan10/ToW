package com.jz.tow.handler;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jz.tow.Constants;
import com.jz.tow.Game;
import com.jz.tow.OpCodes;
import com.jz.tow.WSMessage;
import com.jz.tow.manager.TowManager;

@Component
public class TowWebSocketHandler extends TextWebSocketHandler {
	private Logger logger = LoggerFactory.getLogger(TowWebSocketHandler.class);

	@Autowired
	private TowManager towManager;

	private Queue<WebSocketSession> connectionQueue = new LinkedList<WebSocketSession>();
	private Map<WebSocketSession, Game> games = new HashMap<WebSocketSession, Game>();

	@Autowired
	@Qualifier("lock")
	private Object lock;

	@Autowired
	@Qualifier("objectMapper")
	private ObjectMapper objectMapper;
	
	@Override
	public void afterConnectionEstablished(WebSocketSession playerASocket) throws Exception {
		super.afterConnectionEstablished(playerASocket);

		WebSocketSession playerBSocket = null;

		synchronized (lock) {
			playerBSocket = connectionQueue.poll();

			if (playerBSocket == null) {
				connectionQueue.add(playerASocket);
				return;
			}
		}

		Game game = new Game();
		game.setPlayerA(playerASocket);
		game.setPlayerB(playerBSocket);

		games.put(playerASocket, game);
		games.put(playerBSocket, game);
		
		WSMessage m = WSMessage.newMessage(OpCodes.START_GAME);
		m.setStartTime(System.currentTimeMillis() + Constants.START_TIME_DELAY);
		
		TextMessage tm = new TextMessage(objectMapper.writeValueAsString(m));
		playerASocket.sendMessage(tm);
		playerBSocket.sendMessage(tm);
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		super.afterConnectionClosed(session, status);
	}

	@Override
	public void handleTextMessage(WebSocketSession session, TextMessage message) {
		System.out.println();
	}
}