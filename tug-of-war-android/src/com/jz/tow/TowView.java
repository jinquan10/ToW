package com.jz.tow;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.BitmapFactory.Options;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
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
			int fromTheMiddle = Constants.FROM_THE_MIDDLE;

			DisplayMetrics displaymetrics = context.getResources().getDisplayMetrics();
			int aHeight = displaymetrics.heightPixels;
			int aWidth = displaymetrics.widthPixels;

			Options ropeOptions = new Options();
			Bitmap rope = makeRope(fromTheMiddle, aHeight, ropeOptions);
			int ropeLeft = (aWidth / 2) - (rope.getWidth() / 2);
			int ropeTop = -(fromTheMiddle / 2);

			Options knotOptions = new Options();
			Bitmap knot = makeKnot(knotOptions);
			int knotLeft = (aWidth / 2) - (knot.getWidth() / 2);
			int knotTop = (aHeight / 2) - (knot.getHeight() / 2);

			Paint linePaint = new Paint();
			linePaint.setStyle(Paint.Style.STROKE);
			linePaint.setStrokeJoin(Paint.Join.ROUND);
			linePaint.setStrokeCap(Paint.Cap.ROUND);
			linePaint.setStrokeWidth(5);
			linePaint.setColor(Color.WHITE);

			int radius = fromTheMiddle;
			int topLine = aHeight / 2 - fromTheMiddle - radius;
			int bottomLine = aHeight / 2 + fromTheMiddle + radius;
			int lineLeft = aWidth / 2 - radius;
			Path frownPath = createSemiCircle(radius, lineLeft, bottomLine, false);
			Path smilePath = createSemiCircle(radius, lineLeft, topLine, true);

			while (isRunning) {
				if (sh.getSurface().isValid()) {
					Canvas c = sh.lockCanvas();

					try {
						if (c == null) {
							continue;
						}

						c.drawPath(frownPath, linePaint);
						c.drawPath(smilePath, linePaint);
						c.drawBitmap(rope, ropeLeft, ropeTop, null);
						c.drawBitmap(knot, knotLeft, knotTop, null);

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

		private Path createSemiCircle(int radius, float x, float y, boolean isSmile) {
			// y = sqrt(radius ^ 2 - x^2);

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
			return Bitmap.createScaledBitmap(rope, ropeOptions.outWidth, aHeight + fromTheMiddle + 4, false);
		}
	}
}
