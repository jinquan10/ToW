package com.jz.tow;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import android.view.WindowManager;

import com.koushikdutta.async.ByteBufferList;
import com.koushikdutta.async.DataEmitter;
import com.koushikdutta.async.callback.DataCallback;
import com.koushikdutta.async.future.Future;
import com.koushikdutta.async.http.AsyncHttpClient;
import com.koushikdutta.async.http.AsyncHttpClient.WebSocketConnectCallback;
import com.koushikdutta.async.http.WebSocket;
import com.koushikdutta.async.http.WebSocket.StringCallback;

public class MainActivity extends Activity {
	private static final String WebSocketUrlLocal = "ws://192.168.1.101:8082/tow/update";

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		connect(WebSocketUrlLocal);
		removeBars();
		TowView tv = new TowView(getApplicationContext());

		setContentView(tv);
	}

	private void removeBars() {
		this.requestWindowFeature(Window.FEATURE_NO_TITLE);
		this.getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
	}

	private void connect(String url) {
		final Future<WebSocket> ws = AsyncHttpClient.getDefaultInstance().websocket(url, null, new WebSocketConnectCallback() {
			@Override
			public void onCompleted(Exception ex, final WebSocket webSocket) {
				if (ex != null) {
					ex.printStackTrace();
					return;
				}

				webSocket.setStringCallback(new StringCallback() {
					public void onStringAvailable(String str) {
						Log.d("jzjz", str);

						// Toast t = Toast.makeText(getApplicationContext(),
						// "Connected!", 500);
						// t.setGravity(Gravity.BOTTOM|Gravity.CENTER, 0, 0);
						// t.show();
					}
				});

				webSocket.setDataCallback(new DataCallback() {
					public void onDataAvailable(ByteBufferList byteBufferList) {
					}

					@Override
					public void onDataAvailable(DataEmitter arg0, ByteBufferList arg1) {

					}
				});
			}
		});
	}
}
