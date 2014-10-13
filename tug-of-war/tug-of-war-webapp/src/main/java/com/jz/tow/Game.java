package com.jz.tow;

import org.springframework.web.socket.WebSocketSession;

public class Game {
	private WebSocketSession playerA;
	private WebSocketSession playerB;
	
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
}
