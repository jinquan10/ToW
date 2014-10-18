package com.jz.tow.manager;

import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jz.tow.Constants;
import com.jz.tow.Game;
import com.jz.tow.OpCodes;
import com.jz.tow.WSMessage;

@Component
public class TowManager {
	@Autowired
	@Qualifier("objectMapper")
	private ObjectMapper objectMapper;

	@Autowired
	@Qualifier("lock")
	private Object lock;

	private Queue<WebSocketSession> gameQueue = new LinkedList<WebSocketSession>();
	private Map<WebSocketSession, Game> runningGames = new HashMap<WebSocketSession, Game>();
	private Set<WebSocketSession> connections = new HashSet<WebSocketSession>();

	public void startGame(WebSocketSession playerASocket) throws JsonProcessingException, IOException {
		WebSocketSession playerBSocket = null;

		synchronized (lock) {
			playerBSocket = gameQueue.poll();

			if (playerBSocket == null) {
				gameQueue.add(playerASocket);
				return;
			}
		}

		Game game = new Game();
		game.setPlayerA(playerASocket);
		game.setPlayerB(playerBSocket);

		runningGames.put(playerASocket, game);
		runningGames.put(playerBSocket, game);

		WSMessage m = WSMessage.newMessage(OpCodes.START_GAME);
		m.setStartTime(System.currentTimeMillis() + Constants.START_TIME_DELAY);

		TextMessage tm = new TextMessage(objectMapper.writeValueAsString(m));
		playerASocket.sendMessage(tm);
		playerBSocket.sendMessage(tm);
	}
	
	public void handleNewConnection(WebSocketSession session) {
		this.connections.add(session);
	}
	
	public void handleClosedConnection(WebSocketSession session) {
		this.connections.remove(session);
	}
}
