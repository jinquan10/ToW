package com.jz.tow;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Game {
	private WebSocketSession playerA;
	private WebSocketSession playerB;
	private long startTime;
	private long tickedTime;

	private int tugs; // - positive == playerB

	private ObjectMapper objectMapper;
	
	public Game(WebSocketSession playerASocket, WebSocketSession playerBSocket, ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
		this.playerA = playerASocket;
		this.playerB = playerBSocket;
		this.tugs = 0;
		this.startTime = System.currentTimeMillis() + Constants.START_TIME_DELAY;
		this.tickedTime = this.startTime;
	}

	public void tug(String id, int tug) throws JsonProcessingException, IOException {
		long epoch = System.currentTimeMillis();

		if (epoch < startTime) {
			return;
		}
		
		if (this.playerA.getId().equals(id)) {
			this.tugs -= tug;
		} else {
			this.tugs += tug;
		}
		
		
		if (epoch > this.tickedTime) {
			updatePlayers();
			this.tickedTime = epoch; 
		} else {
			return;
		}
		
		if (this.tugs < -Constants.WIN_TUGS) { // - playerA wins
			handlePlayerHasWon(playerA, true);
			handlePlayerHasWon(playerB, false);
		} else {
			handlePlayerHasWon(playerA, false);
			handlePlayerHasWon(playerB, true);			
		}
	}

	private void updatePlayers() throws JsonProcessingException, IOException { // - updates the position of the rope
		WSMessage msg = new WSMessage();
		msg.setOp(OpCodes.UPDATE_ROPE);
		msg.setTug(-tugs);
		
		this.playerA.sendMessage(new TextMessage(this.objectMapper.writeValueAsString(msg)));
		
		msg = new WSMessage();
		msg.setOp(OpCodes.UPDATE_ROPE);
		msg.setTug(tugs);
		
		this.playerB.sendMessage(new TextMessage(this.objectMapper.writeValueAsString(msg)));
	}

	private void handlePlayerHasWon(WebSocketSession player, boolean hasWon) throws JsonProcessingException, IOException {
		WSMessage msg = new WSMessage();
		msg.setOp(OpCodes.A_PLAYER_HAS_WON);
		msg.setHasWon(hasWon);
		
		player.sendMessage(new TextMessage(this.objectMapper.writeValueAsString(msg)));
	}
	
	public WebSocketSession getPlayerA() {
		return playerA;
	}

	public void setPlayerA(WebSocketSession playerA) {
		this.playerA = playerA;
	}

	public WebSocketSession getPlayerB() {
		return playerB;
	}

	public void setPlayerB(WebSocketSession playerB) {
		this.playerB = playerB;
	}

	public long getStartTime() {
		return startTime;
	}

	public void setStartTime(long startTime) {
		this.startTime = startTime;
	}

	public long getTickedTime() {
		return tickedTime;
	}

	public void setTickedTime(long tickedTime) {
		this.tickedTime = tickedTime;
	}
}