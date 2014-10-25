package com.jz.tow;

public class WSMessage {
	private int op;
	private long startTime;
	private float tug;
	private boolean hasWon;

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

	public boolean isHasWon() {
		return hasWon;
	}

	public void setHasWon(boolean hasWon) {
		this.hasWon = hasWon;
	}

	public float getTug() {
		return tug;
	}

	public void setTug(float tug) {
		this.tug = tug;
	}
}
