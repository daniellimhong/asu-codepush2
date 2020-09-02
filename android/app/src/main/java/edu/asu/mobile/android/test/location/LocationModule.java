package edu.asu.mobile.android.test.location;

import android.content.Intent;
import android.os.Build;
import android.util.Log;

import edu.asu.mobile.android.test.geofence.GeofencingRegisterer;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by kcoblent on 4/2/18.
 */

public class LocationModule extends ReactContextBaseJavaModule {
    ReactApplicationContext rContext;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        rContext = reactContext;
    }

    public String getName() {
        return "LocationModule";
    }

    @ReactMethod
    public void init() {
//        Log.e("HERE","NOT");
        rContext.startService(new Intent(rContext, LocationService.class));
    }

    public ReactApplicationContext getContext() {
        return rContext;
    }
}
