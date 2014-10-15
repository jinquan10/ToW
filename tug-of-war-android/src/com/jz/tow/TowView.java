package com.jz.tow;

import android.app.Activity;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapFactory.Options;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Rect;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class TowView extends SurfaceView implements SurfaceHolder.Callback {

	private int color;
	private TowThread th;
	private boolean isRunning = false;
	private Context context;
	
	public TowView(Context context) {
		super(context);

		getHolder().addCallback(this);
		color = Color.WHITE;
		this.context = context;
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
			long count = 0;
			long time = System.currentTimeMillis();

			Options options = new Options();
			options.inJustDecodeBounds = true;
			BitmapFactory.decodeResource(getResources(), R.drawable.ropealpha, options);
			Bitmap rope = BitmapFactory.decodeResource(getResources(), R.drawable.ropealpha);

			DisplayMetrics displaymetrics = context.getResources().getDisplayMetrics();
			int aHeight = displaymetrics.heightPixels;
			int aWidth = displaymetrics.widthPixels;
			
			int left = (aWidth / 2) - (options.outWidth / 2);
			
			while (isRunning) {
				if (sh.getSurface().isValid()) {
					Canvas c = sh.lockCanvas();

					try {
						if (c == null) {
							continue;
						}

						c.translate(left, 0);
						c.drawBitmap(rope, null, new Rect(0, 0, options.outWidth, 1920), null);
						
						count++;
						if (count % 100 == 0) {
							Log.d("jzjz", "fps = " + count / ((System.currentTimeMillis() - time) / 1000));
						}
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
