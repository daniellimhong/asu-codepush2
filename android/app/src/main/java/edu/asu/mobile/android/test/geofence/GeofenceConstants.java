package edu.asu.mobile.android.test.geofence;

/**
 * Created by kcoblent on 3/30/18.
 */


import android.os.AsyncTask;
import android.util.Log;

import com.google.android.gms.maps.model.LatLng;

import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;

import javax.net.ssl.HttpsURLConnection;

import edu.asu.mobile.android.test.UserInfo;

/**
 * Constants used in this sample.
 */

final class GeofenceConstants {

    private String TAG = "GEOFENCE CONSTANT";
    String urlString = "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/geofence";
//    String urlString = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod/location";
    String operation = "getGeofences";

    private GeofenceConstants() {
    }

    private static final String PACKAGE_NAME = "com.google.android.gms.location.Geofence";

    static final String GEOFENCES_ADDED_KEY = PACKAGE_NAME + ".GEOFENCES_ADDED_KEY";

    /**
     * Used to set an expiration time for a geofence. After this amount of time Location Services
     * stops tracking the geofence.
     */
    private static final long GEOFENCE_EXPIRATION_IN_HOURS = 12;

    /**
     * For this sample, geofences expire after twelve hours.
     */
    static final long GEOFENCE_EXPIRATION_IN_MILLISECONDS =
            GEOFENCE_EXPIRATION_IN_HOURS * 60 * 60 * 1000;
    static final float GEOFENCE_RADIUS_IN_METERS = 75; // 1 mile, 1.6 km
    static final float GEOFENCE_CAMPUS_RADIUS_IN_METERS = 1000; // 1 mile, 1.6 km

    /**
     * Map for storing information about airports in the San Francisco bay area.
     */
    static final HashMap<String, LatLng> ASU_GEOFENCES = new HashMap<>();
    static final HashMap<String, LatLng> ASU_CAMPUS = new HashMap<>();
//    static final HashMap<String, String> ASU_CAMPUS_CENTERS = new HashMap<>();


    static {

        ASU_GEOFENCES.put("62810", new LatLng(33.347099,-111.899658)); //Research Park
        ASU_GEOFENCES.put("62848", new LatLng(33.416550,-111.933838)); //BAC
        ASU_GEOFENCES.put("62847", new LatLng(33.416618,-111.934509)); //BA
        ASU_GEOFENCES.put("62951", new LatLng(33.416828,-111.933197)); //MCRD
        ASU_GEOFENCES.put("93878", new LatLng(33.417690,-111.934349)); //MU
        ASU_GEOFENCES.put("231607", new LatLng(33.418575,-111.933685)); //Student Pavillion
        ASU_GEOFENCES.put("63152", new LatLng(33.421295,-111.933014)); //Health Service Building
        ASU_GEOFENCES.put("68020", new LatLng(33.416004,-111.932632)); //SDFC HEalth Services
        ASU_GEOFENCES.put("63127", new LatLng(33.608727,-112.160942)); //West union
        ASU_GEOFENCES.put("65161", new LatLng(33.307129,-111.677116)); //Student Union at Poly
        ASU_GEOFENCES.put("188003", new LatLng(33.452873,-112.073395)); //Downtwon Union

        ASU_CAMPUS.put("Tempe", new LatLng(33.419105, -111.932888));
        ASU_CAMPUS.put("Downtown", new LatLng(33.454274, -112.070491));
        ASU_CAMPUS.put("Thunderbird", new LatLng(33.622323, -112.182053));
        ASU_CAMPUS.put("Poly", new LatLng(33.306847, -111.677109));
        ASU_CAMPUS.put("West", new LatLng(33.608014, -112.159764));
        ASU_CAMPUS.put("Research", new LatLng(33.342248, -111.896972));

//        ASU_CAMPUS_CENTERS.put("Tempe", "33.421538,-111.933636,1200");
//        ASU_CAMPUS_CENTERS.put("Downtown", "33.453473,-112.073175,590");
//        ASU_CAMPUS_CENTERS.put("Poly", "33.306978,-111.676700,535");
//        ASU_CAMPUS_CENTERS.put("West", "33.608272,-112.160940,835");
//
//        ASU_CAMPUS_CENTERS.put("Tempe", "33.421538,-111.933636,1200");
//        ASU_CAMPUS_CENTERS.put("Downtown", "33.453473,-112.073175,590");
//        ASU_CAMPUS_CENTERS.put("Poly", "33.306978,-111.676700,535");
//        ASU_CAMPUS_CENTERS.put("West", "33.608272,-112.160940,835");

    }

}
