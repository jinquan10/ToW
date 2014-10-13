package com.jz.tow;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class TowView extends SurfaceView implements SurfaceHolder.Callback {

	private int color;
	private TowThread th;
	private boolean isRunning = false;

	public TowView(Context context) {
		super(context);

		getHolder().addCallback(this);
		color = Color.WHITE;
	}

	@Override
	public boolean onTouchEvent(MotionEvent event) {
		super.onTouchEvent(event);

		if (event.getAction() != MotionEvent.ACTION_UP) {
			return true;
		}

		if (color == Color.WHITE) {
			color = Color.BLACK;
		} else {
			color = Color.WHITE;
		}

		return true;
	}

	@Override
	public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {

	}

	@Override
	public void surfaceCreated(SurfaceHolder holder) {
		th = new TowThread();
		isRunning = true;
		th.start();
	}

	@Override
	public void surfaceDestroyed(SurfaceHolder holder) {
		isRunning = false;
		try {
			th.join();
		} catch (InterruptedException e) {
		}
	}

	class TowThread extends Thread {
		private SurfaceHolder sh;

		public TowThread() {
			this.sh = getHolder();
		}

		@Override
		public void run() {
			while (isRunning) {
				if (sh.getSurface().isValid()) {
					Canvas c = sh.lockCanvas();

					try {
						if (c == null) {
							continue;
						}

						c.drawColor(TowView.this.color);
					} finally {

						if (c != null) {
							sh.unlockCanvasAndPost(c);
						}
					}
				}
			}
		}
	}
}
