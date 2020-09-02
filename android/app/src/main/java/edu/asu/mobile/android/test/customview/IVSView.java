package edu.asu.mobile.android.test.customview;

import android.content.Context;
//import android.support.constraint.ConstraintLayout;
import android.graphics.Color;
import android.graphics.ColorSpace;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.Choreographer;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.AccelerateInterpolator;
import android.view.animation.AlphaAnimation;
import android.view.animation.Animation;
import android.view.animation.AnimationSet;
import android.view.animation.AnimationUtils;
import android.view.animation.DecelerateInterpolator;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.constraintlayout.widget.ConstraintLayout;

import com.amazonaws.ivs.player.Cue;
import com.amazonaws.ivs.player.Player;
import com.amazonaws.ivs.player.PlayerException;
import com.amazonaws.ivs.player.PlayerView;
import com.amazonaws.ivs.player.Quality;
import com.amazonaws.ivs.player.TextMetadataCue;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.Random;
import java.util.UUID;

import javax.net.ssl.HttpsURLConnection;

import edu.asu.mobile.android.test.R;

public class IVSView extends LinearLayout {

    public Context context;
    private PlayerView playerView;
    private Player player;
    private String currentVideoUrl;
    private Player.Listener playerListeners;
    private JSONArray emojis;
    final private int MAX_REACTIONS = 25000;
    private String[] myReactions = new String[MAX_REACTIONS];
    private int reactionMarker = 0;
    private String TAG = "IVSView";
    private Boolean isCleaning = false;
    final private int MAX_NUMBER = 50;
    private Boolean canClick = true;
    private double lastClickTime = 0.0;
    private double LASTCLICK_MIN = 750.0;


    final private String urlBase = "https://a7n0975z9k.execute-api.us-west-2.amazonaws.com/dev/emoji";

    public IVSView(Context context) {
        super(context);
        this.context = context;
        setupLayoutHack();
        init();
        cleanView();
    }

    void setupLayoutHack() {

        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren();
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    void manuallyLayoutChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            child.measure(MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.EXACTLY));
            child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
        }
    }

    public void init() {
        inflate(context, R.layout.ivs_portrait, this);
        playerView = findViewById(R.id.playerView);
        player = playerView.getPlayer();
        addListeners();
    }

    public void setUrl(String url) {
        currentVideoUrl = url;
        playUrl();
    }

    public void destroySession() {
        player.removeListener(playerListeners);
        player.pause();
        player.release();
    }

    public void setEmojis(String e) {

        try {
            emojis = new JSONArray(e);

            for( int i = 0; i < emojis.length(); ++i ) {
                JSONObject currObj = (JSONObject)emojis.getJSONObject(i);
                createButton(i,currObj.getString("icon"));
            }

        } catch (JSONException ex) {
            ex.printStackTrace();
        }

    }

    private void createButton(int index, String icon) {

        LinearLayout layout = (LinearLayout) findViewById(R.id.emojiContainer);

        Button btnTag = new Button(context);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT);
        p.weight = 1;

        btnTag.setLayoutParams(p);
        btnTag.setText(icon);
        btnTag.setId(index);

        btnTag.setOnClickListener(onClick());

        layout.addView(btnTag);
    }

    private OnClickListener onClick() {
        return new OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    JSONObject currObj = (JSONObject)emojis.getJSONObject(v.getId());
                    String icon = currObj.getString("icon");
                    String name = currObj.getString("name");

                    if( canClick && reactionMarker < MAX_REACTIONS-1 ) {
                        final String reqId = UUID.randomUUID().toString();
                        myReactions[reactionMarker] = reqId;
                        ++reactionMarker;
                        new CallAPI().execute(name,reqId);
                        shouldDisplayEmoji(icon);
                    }

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
    }

    private void shouldDisplayEmoji(String icon) {

        RelativeLayout ec = (RelativeLayout) findViewById(R.id.emojiAnimator);

        double lastClickDIff = SystemClock.uptimeMillis()-lastClickTime;

        if( ec.getChildCount() < MAX_NUMBER && !isCleaning && canClick && lastClickDIff > LASTCLICK_MIN) {

            lastClickTime = SystemClock.uptimeMillis();
            WaveyTextView tv = new WaveyTextView(this.context);

            RelativeLayout.LayoutParams p = new RelativeLayout.LayoutParams(ec.getWidth()+200, ViewGroup.LayoutParams.MATCH_PARENT);
            int id = randomNum(1,1000);

            tv.setWaveLength(randomNum(ec.getWidth()/2,ec.getWidth()));
            tv.setTextSize(randomNum(15,25));

            int paddingNum = randomNum(10,15);

            tv.setPadding(0, paddingNum, 0, paddingNum);
            tv.setId(randomNum(1,8000));
            tv.setText(icon);
            tv.setId(id);
            ec.addView(tv,p);

            int animTime =randomNum(2000,4000);

            Animation fadeIn = new AlphaAnimation(0,1);
            fadeIn.setInterpolator(new DecelerateInterpolator());
            fadeIn.setDuration(100);

            Animation fadeOut = new AlphaAnimation(1, 0);
            fadeOut.setInterpolator(new AccelerateInterpolator());
            fadeOut.setStartOffset(100);
            fadeOut.setDuration(animTime);

            AnimationSet animation = new AnimationSet(false);
            animation.addAnimation(fadeIn);
            animation.addAnimation(fadeOut);

            tv.animateToRight(animTime);
            tv.setAnimation(animation);
            setTimeout(() -> removeEmoji(id,animTime), animTime+100);
        }

    }

    private void cleanView() {
        Handler h = new Handler(Looper.getMainLooper());
        h.postAtTime(new Runnable() {
            @Override
            public void run() {
                isCleaning = true;
                RelativeLayout ec = (RelativeLayout) findViewById(R.id.emojiAnimator);
                for(int i = 0; i<ec.getChildCount(); i++){
                    if(ec.getChildAt(i) instanceof TextView){
                        if( ec.getChildAt(i).getAnimation() == null ) {
                            ec.removeView(ec.getChildAt(i));
                        }
                    }
                }
                isCleaning = false;
            }
        }, 2500);
        setTimeout(() -> cleanView(), 2500);
    }

    private void removeEmoji(int id, int len) {
        Handler h = new Handler(Looper.getMainLooper());
        h.postAtTime(new Runnable() {
            @Override
            public void run() {
                TextView tv = findViewById(id);
                tv.setVisibility(View.GONE);
            }
        }, len+100);
    }

    private int randomNum(int min, int max) {
        return new Random().nextInt((max - min) + 1) + min;
    }

    public void playUrl() {
        player.load(Uri.parse(currentVideoUrl));
    }

    public static void setTimeout(Runnable runnable, int delay){
        new Thread(() -> {
            try {
                Thread.sleep(delay);
                runnable.run();
            }
            catch (Exception e){
                System.err.println(e);
            }
        }).start();
    }

    public void addListeners() {

        playerListeners = new Player.Listener() {
            @Override
            public void onCue(@NonNull Cue cue) {

                TextMetadataCue c = (TextMetadataCue) cue;
                try {
                    JSONObject obj = new JSONObject(c.text);
                    String type = obj.getString("type");
                    String id = obj.getString("processedId");

                    if( !Arrays.asList(myReactions).contains(id) ) {
                        for( int i = 0; i < emojis.length(); ++i ) {
                            JSONObject currObj = null;
                            try {
                                currObj = (JSONObject)emojis.getJSONObject(i);
                                String name = currObj.getString("name");
                                String icon = currObj.getString("icon");

                                if( name.equals(type) ) {
                                    shouldDisplayEmoji(icon);
                                }
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }

                        }
                    } else {

                    }

                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onDurationChanged(long l) {}

            @Override
            public void onStateChanged(@NonNull Player.State state) {
                Log.d("PLAYER","STATE CHANGE: "+state);
                switch (state) {
                    case BUFFERING:
                        // player is buffering
                        break;
                    case READY:
                        player.play();
                        break;
                    case IDLE:
                        break;
                    case PLAYING:
                        // playback started
                        break;
                }
            }

            @Override
            public void onError(@NonNull PlayerException e) {}

            @Override
            public void onRebuffering() {}

            @Override
            public void onSeekCompleted(long l) {}

            @Override
            public void onVideoSizeChanged(int i, int i1) {}

            @Override
            public void onQualityChanged(@NonNull Quality quality) {}
        };


        player.addListener(playerListeners);
    }

    public class CallAPI extends AsyncTask<String, String, String> {

        public CallAPI(){
            //set context variables if required
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
        }


        @Override
        protected String doInBackground(String... params) {

            canClick = false;

            String emoji = params[0];
            String id = params[1];

            OutputStream out = null;
            URL url;
            String response = "";
            BufferedWriter writer = null;
            OutputStream os = null;
            BufferedReader responseStreamReader = null;
            InputStream responseStream = null;

            try {

                url = new URL(urlBase+"?type="+emoji+"&id="+id);

                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setReadTimeout(150000); //milliseconds
                conn.setConnectTimeout(15000); // milliseconds
                conn.setRequestMethod("GET");
                conn.connect();

                canClick = true;
                int responseCode=conn.getResponseCode();

                if (responseCode == HttpsURLConnection.HTTP_OK) {
                    responseStream = new BufferedInputStream(conn.getInputStream());
                    responseStreamReader = new BufferedReader(new InputStreamReader(responseStream));
                    String line = "";
                    StringBuilder stringBuilder = new StringBuilder();
                    while ((line = responseStreamReader.readLine()) != null) {
                        stringBuilder.append(line);
                    }
                }

                try {
                    if( responseStreamReader != null) {
                        responseStreamReader.close();
                    }

                    if( responseStream != null) {
                        responseStream.close();
                    }


                    conn.disconnect();
                } catch (Exception e) {
                    e.printStackTrace();
                }


            } catch (Exception e) {
                Log.e(TAG, "ERROR IN BACKGROUND "+e);
            }
            return emoji;
        }
    }
}
