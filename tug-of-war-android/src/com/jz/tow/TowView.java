package com.jz.tow;

import java.util.Random;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapFactory.Options;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.MotionEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;

public class TowView extends SurfaceView implements SurfaceHolder.Callback {

	private TowThread th;
	private boolean isRunning = false;
	private Context context;
	private boolean isMoving;
	private Random random = new Random();
	
	private int mX, mY;
	
	public TowView(Context context) {
		super(context);

		getHolder().addCallback(this);
		this.context = context;
		this.isMoving = false;
		this.mX = -1;
		this.mY = -1;
	}

	@Override
	public boolean onTouchEvent(MotionEvent event) {
		super.onTouchEvent(event);

		int action = event.getAction();
		int x = (int) event.getX();
		int y = (int) event.getY();
		
		if (x != mX || y != mY) {
			this.isMoving = true;
			mX = x;
			mY = y;
		} else {
			this.isMoving = false;
		}
		
		if (action == MotionEvent.ACTION_UP) {
			this.isMoving = false;
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
			int fromTheMiddle = Constants.FROM_THE_MIDDLE;

			DisplayMetrics displaymetrics = context.getResources().getDisplayMetrics();
			int aHeight = displaymetrics.heightPixels;
			int aWidth = displaymetrics.widthPixels;

			Options ropeOptions = new Options();
			Bitmap rope = makeRope(fromTheMiddle, aHeight, ropeOptions);
			int ropeLeft = (aWidth / 2) - (rope.getWidth() / 2);
			int ropeTop = -fromTheMiddle;

			Options knotOptions = new Options();
			Bitmap knot = makeKnot(knotOptions);
			int knotLeft = (aWidth / 2) - (knot.getWidth() / 2);
			int knotTop = (aHeight / 2) - (knot.getHeight() / 2);

			Paint linePaint = createSemiCirclePaint();

			int radius = fromTheMiddle;
			int topLine = aHeight / 2 - fromTheMiddle - radius;
			int bottomLine = aHeight / 2 + fromTheMiddle + radius;
			int lineLeft = aWidth / 2 - radius;
			Path frownPath = createSemiCircle(radius, lineLeft, bottomLine, false);
			Path smilePath = createSemiCircle(radius, lineLeft, topLine, true);

			while (isRunning) {
				if (sh.getSurface().isValid()) {
					Canvas canvas = sh.lockCanvas();

					try {
						if (canvas == null) {
							continue;
						}

						canvas.drawColor(Color.BLACK);
						canvas.drawPath(frownPath, linePaint);
						canvas.drawPath(smilePath, linePaint);
						
						drawRope(rope, knot, ropeLeft, ropeTop, knotLeft, knotTop, canvas);
					} finally {

						if (canvas != null) {
							sh.unlockCanvasAndPost(canvas);
						}
					}
				}
			}
		}

		private void drawRope(Bitmap rope, Bitmap knot, int ropeLeft, int ropeTop, int knotLeft, int knotTop, Canvas canvas) {
			if (isMoving) {
				boolean leftOrRight = random.nextBoolean();
				int randomLength = (leftOrRight == true) ? (int) (random.nextFloat() * Constants.ROPE_VIBRATION_X) : (int) (-1 * random.nextFloat() * Constants.ROPE_VIBRATION_X);
				ropeLeft += randomLength;
				knotLeft += randomLength;
			}
			
			canvas.drawBitmap(rope, ropeLeft, ropeTop, null);
			canvas.drawBitmap(knot, knotLeft, knotTop, null);
		}
		
		private Paint createSemiCirclePaint() {
			Paint linePaint = new Paint();
			linePaint.setStyle(Paint.Style.STROKE);
			linePaint.setStrokeJoin(Paint.Join.ROUND);
			linePaint.setStrokeCap(Paint.Cap.ROUND);
			linePaint.setStrokeWidth(Constants.SEMI_CIRCLE_WIDTH);
			linePaint.setColor(Color.WHITE);
			return linePaint;
		}

		private Path createSemiCircle(int radius, float x, float y, boolean isSmile) {
			float offset = (radius / 2);
			float a = -radius + offset;
			float x1 = x + offset;
			float radiusSqrd = radius * radius;

			float y1;

			if (isSmile) {
				y1 = y + (float) Math.sqrt(radiusSqrd - (a * a));
			} else {
				y1 = y - (float) Math.sqrt(radiusSqrd - (a * a));
			}

			Path p = new Path();

			p.moveTo(x1, y1);

			for (int i = (int) (-radius + offset + 1); i < radius - offset + 1; i++) {
				float dy = (float) Math.sqrt(radiusSqrd - (i * i));

				float x3 = x1 + 1;
				float y3 = 0.f;

				if (isSmile) {
					y3 = y + dy;
				} else {
					y3 = y - dy;
				}

				float x2 = (x1 + x3) / 2;
				float y2 = (y1 + y3) / 2;
				p.quadTo(x2, y2, x3, y3);
				x1 = x3;
				y1 = y3;
			}

			return p;
		}

		private Bitmap makeKnot(Options knotOptions) {
			knotOptions.inJustDecodeBounds = true;
			BitmapFactory.decodeResource(getResources(), R.drawable.knot, knotOptions);
			Bitmap knot = BitmapFactory.decodeResource(getResources(), R.drawable.knot);
			return Bitmap.createScaledBitmap(knot, knotOptions.outWidth * 3, knotOptions.outHeight * 3, false);
		}

		private Bitmap makeRope(int fromTheMiddle, int aHeight, Options ropeOptions) {
			ropeOptions.inJustDecodeBounds = true;
			BitmapFactory.decodeResource(getResources(), R.drawable.rope, ropeOptions);
			Bitmap rope = BitmapFactory.decodeResource(getResources(), R.drawable.rope);
			return Bitmap.createScaledBitmap(rope, ropeOptions.outWidth, aHeight + (fromTheMiddle * 2) + 4, false);
		}
	}
}
