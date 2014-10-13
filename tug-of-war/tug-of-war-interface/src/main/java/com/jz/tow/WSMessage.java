package com.jz.tow;

public class WSMessage {
	private int op;
	private long startTime;
	
	public static WSMessage newMessage(int op) {
		WSMessage m = new WSMessage();
		m.setOp(op);
		
		return m;
	}
	
	public int getOp() {
		return op;
	}

	public void setOp(int op) {
		this.op = op;
	}

	public long getStartTime() {
		return startTime;
	}

	public void setStartTime(long startTime) {
		this.startTime = startTime;
	}
}
