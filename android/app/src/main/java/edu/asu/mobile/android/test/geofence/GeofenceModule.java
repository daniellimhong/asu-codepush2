package edu.asu.mobile.android.test.geofence;

import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

import java.util.Map;
import java.util.HashMap;

/**
 * Created by kcoblent on 4/2/18.
 */

public class GeofenceModule extends ReactContextBaseJavaModule  {
    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    ReactApplicationContext rContext;

    public GeofenceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        rContext = reactContext;
    }

    public String getName() {
        return "GeofenceModule";
    }

    @ReactMethod
    public void init(Double lat,Double lon) {
        Log.e("GEOFENCE",lat+":"+lon);
        GeofencingRegisterer geo = new GeofencingRegisterer(rContext);
        geo.initGeofences(lat,lon);
        geo.getGeofencesAdded();
    }

}
