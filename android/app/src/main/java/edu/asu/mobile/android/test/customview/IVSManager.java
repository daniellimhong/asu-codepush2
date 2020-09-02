package edu.asu.mobile.android.test.customview;

import android.content.Context;
import android.net.Uri;
import android.util.Log;
import android.widget.VideoView;

import com.amazonaws.ivs.player.PlayerView;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import org.json.JSONArray;

import edu.asu.mobile.android.test.R;

public class IVSManager extends SimpleViewManager<IVSView> {
    public static final String REACT_CLASS = "MyViewMan";
    public static Context mainContext;
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public IVSView createViewInstance(ThemedReactContext context) {
        mainContext = context;
        return new IVSView(context);
    }

    @ReactProp(name="streamUrl")
    public void setVideoPath(IVSView ivsView, String urlPath) {
//        urlPath = "https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.DmumNckWFTqz.m3u8";
        ivsView.setUrl(urlPath);
    }

    @ReactProp(name="emojis")
    public void setEmojis(IVSView ivsView, String emojis) {
        ivsView.setEmojis(emojis);
    }

    @ReactProp(name="shouldPlay")
    public void setShouldPlay(IVSView ivsView, String shouldPlay) {
        if( shouldPlay.equals("destroy") ) {
            ivsView.destroySession();
        }
    }


    public static Context getContext() {
        return mainContext;
    }


}