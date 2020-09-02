package edu.asu.mobile.android.test.geofence;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.res.Resources;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.location.Location;
import android.os.AsyncTask;
import android.provider.Settings;
import android.support.v4.app.JobIntentService;
import android.support.v4.app.NotificationCompat;
import android.text.TextUtils;
import android.util.Log;

import edu.asu.mobile.android.test.UserInfo;
import edu.asu.mobile.android.test.location.NearestCampus;

import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingEvent;

import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import javax.net.ssl.HttpsURLConnection;

import static java.lang.Double.parseDouble;

/**
 * Listener for geofence transition changes.
 *
 * Receives geofence transition events from Location Services in the form of an Intent containing
 * the transition type and geofence id(s) that triggered the transition. Creates a notification
 * as the output.
 */
public class GeofenceTransitionsJobIntentService extends JobIntentService {

    private static final int JOB_ID = 573;

    private static final String TAG = "PUTYOURLEFTFOOTOUT";

    private String parentCampus = "";


    String asurite = "";
    String uuid = "";

    /**
     * Convenience method for enqueuing work in to this service.
     */
    public static void enqueueWork(Context context, Intent intent) {
        Log.e(TAG,"starting enqueue work");
        enqueueWork(context, GeofenceTransitionsJobIntentService.class, JOB_ID, intent);
    }

    /**
     * Handles incoming intents.
     * @param intent sent by Location Services. This Intent is provided to Location
     *               Services (inside a PendingIntent) when addGeofences() is called.
     */
    @Override
    protected void onHandleWork(Intent intent) {
        Log.e(TAG,"Starting geofence work");
        GeofencingEvent geofencingEvent = GeofencingEvent.fromIntent(intent);

        if (geofencingEvent.hasError()) {
            String errorMessage = GeofenceErrorMessages.getErrorString(this,
                    geofencingEvent.getErrorCode());
            Log.e(TAG, errorMessage);
            return;
        }

        // Get the transition type.
        int geofenceTransition = geofencingEvent.getGeofenceTransition();

        // Test that the reported transition was of interest.
        if (geofenceTransition == Geofence.GEOFENCE_TRANSITION_ENTER ||
                geofenceTransition == Geofence.GEOFENCE_TRANSITION_EXIT || geofenceTransition == Geofence.GEOFENCE_TRANSITION_DWELL) {

            // Get the geofences that were triggered. A single event can trigger multiple geofences.
            List<Geofence> triggeringGeofences = geofencingEvent.getTriggeringGeofences();

            Date now = new Date();

            if( now.getTime() - UserInfo.lastTimeUpdate.getTime() >= 20*60*1000 ) {
                UserInfo.lastTimeUpdate = now;
                GeofencingRegisterer geo = new GeofencingRegisterer(this);
                geo.initGeofences(geofencingEvent.getTriggeringLocation().getLatitude(),geofencingEvent.getTriggeringLocation().getLongitude());
                geo.getGeofencesAdded();
            }

            // Get the transition details as a String.
            String triggeredGeofence = getGeofenceTransitionDetails(triggeringGeofences);

            String url = "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/geofence";

            String user= UserInfo.asurite;
            String devId= UserInfo.uuid;
            String trigger = getTransitionString(geofenceTransition);

            Location location = geofencingEvent.getTriggeringLocation();
            String latitude = String.valueOf(location.getLatitude());
            String longitude = String.valueOf(location.getLongitude());
            String time = String.valueOf(location.getTime());


            new CallAPI().doInBackground(url,user,trigger,triggeredGeofence,latitude,longitude,time,devId);
            Log.e(TAG, triggeredGeofence + " " + trigger);

        } else {
            // Log the error.
            Log.e(TAG, "Error with geofence " + geofenceTransition);
        }
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

            Log.e(TAG,"DOING IN BACKGROUND WITH "+params);

            //HERE, URL NOT SENDING, 400 ERROR CANT UNDERSTAND URL
            String urlString = params[0]; // URL to call
            String user = params[1]; //data to post
            String trigger = params[2]; //data to post
            String geofence = params[3];
            double lat = parseDouble(params[4]);
            double lon = parseDouble(params[5]);
            long time = Long.parseLong(params[6]);
            String uuid = params[7];

            parentCampus = new NearestCampus().insideCampus(lat,lon);

//            Iterator it = GeofenceConstants.ASU_CAMPUS_CENTERS.entrySet().iterator();
//            while (it.hasNext()) {
//                Map.Entry pair = (Map.Entry)it.next();
//                List<String> itemDistances = Arrays.asList(pair.getValue().toString().split(","));
//                double distanceDiff = distance(lat,lon,parseDouble(itemDistances.get(0)), parseDouble(itemDistances.get(1)));
//                if( parseDouble(itemDistances.get(2)) > distanceDiff ) {
//                    parentCampus = pair.getKey().toString();
//                }
//            }

            OutputStream out = null;
            URL url;
            String response = "";
            BufferedWriter writer = null;
            OutputStream os = null;

            try {

                JSONObject postDataParams = new JSONObject();
                postDataParams.put("operation", "writeLocation");
                postDataParams.put("trigger", trigger);
                postDataParams.put("platform", "Android");
                postDataParams.put("geofence", geofence);
                postDataParams.put("campus", parentCampus);
                postDataParams.put("dUUID", uuid);
                Log.e("params",postDataParams.toString());

                url = new URL(urlString);

                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                //Timeouts are set high to accommodate 3G networks
                conn.setReadTimeout(120000);
                conn.setConnectTimeout(120000);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
                conn.setDoInput(true);
                conn.setDoOutput(true);

                os = conn.getOutputStream();
                writer = new BufferedWriter(new OutputStreamWriter(os, "UTF-8"));
                Log.e(TAG,"POST DATA "+url+getPostDataString(postDataParams));
                writer.write(postDataParams.toString());

                writer.flush();

                int responseCode=conn.getResponseCode();
                Log.e(TAG,String.valueOf(responseCode));

                if (responseCode == HttpsURLConnection.HTTP_OK) {
                    Log.e(TAG,"successfully posted location ");
                }
                else {
                    response="";
                }

                try {
                    writer.close();
                    os.close();
                } catch (Exception e) {
                    e.printStackTrace();
                }


            } catch (Exception e) {
                Log.e(TAG, "ERROR IN BACKGROUND "+e);
                System.out.println(e.getMessage());

            }

            return urlString;
        }
    }

    public String getPostDataString(JSONObject params) throws Exception {

        StringBuilder result = new StringBuilder();
        boolean first = true;

        Iterator<String> itr = params.keys();

        while(itr.hasNext()){

            String key= itr.next();
            Object value = params.get(key);

            if (first)
                first = false;
            else
                result.append("&");

            result.append(URLEncoder.encode(key, "UTF-8"));
            result.append("=");
            result.append(URLEncoder.encode(value.toString(), "UTF-8"));

        }
        return result.toString();
    }

    /**
     * Gets transition details and returns them as a formatted string.
     *
     * @param triggeringGeofences   The geofence(s) triggered.
     * @return                      The transition details formatted as String.
     */
    private String getGeofenceTransitionDetails(List<Geofence> triggeringGeofences) {

        String[] campuses = {"Tempe","West","Poly","Thunderbird","Downtown","Research"};

        // Get the Ids of each geofence that was triggered.
        ArrayList<String> triggeringGeofencesIdsList = new ArrayList<>();
        for (final Geofence geofence : triggeringGeofences) {
            if( Arrays.asList(campuses).contains(geofence.getRequestId()) ) {
                parentCampus = geofence.getRequestId();
            } else {
                triggeringGeofencesIdsList.add(geofence.getRequestId());
            }

        }
        String triggeringGeofencesIdsString = TextUtils.join(", ",  triggeringGeofencesIdsList);

        return triggeringGeofencesIdsString;
    }

    /**
     * Maps geofence transition types to their human-readable equivalents.
     *
     * @param transitionType    A transition type constant defined in Geofence
     * @return                  A String indicating the type of transition
     */
    private String getTransitionString(int transitionType) {
        switch (transitionType) {
            case Geofence.GEOFENCE_TRANSITION_ENTER:
                return "ENTER";
            case Geofence.GEOFENCE_TRANSITION_EXIT:
                return "EXIT";
            case Geofence.GEOFENCE_TRANSITION_DWELL:
                return "DWELL";
            default:
                return "UNKNOWN";
        }
    }

//    private double distance(double lat1, double lng1, double lat2, double lng2) {
//
//        double earthRadius = 6371 * 1000; // in miles, change to 6371 for kilometer output
//
//        double dLat = Math.toRadians(lat2-lat1);
//        double dLng = Math.toRadians(lng2-lng1);
//
//        double sindLat = Math.sin(dLat / 2);
//        double sindLng = Math.sin(dLng / 2);
//
//        double a = Math.pow(sindLat, 2) + Math.pow(sindLng, 2)
//                * Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2));
//
//        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//
//        double dist = earthRadius * c;
//
//        return dist; // output distance, in METERS
//
//    }

//    private void initAsuriteAndUUID() {
//        try {
//            readableDatabase = ReactDatabaseSupplier.getInstance(this.getApplicationContext()).getReadableDatabase();
//            catalystLocalStorage = readableDatabase.query("catalystLocalStorage", new String[]{"value"}, "key = ?", new String[] { "username" }, null, null, null);
//            if( catalystLocalStorage != null && catalystLocalStorage.moveToFirst() ) {
//                final String value = catalystLocalStorage.getString(catalystLocalStorage.getColumnIndex("value"));
//                asurite = value;
//                Log.e("USERNAME",value);
//            } else {
//                Log.e("CURSOR","CURSOR NULL");
//            }
//
//        } finally {
//            if (catalystLocalStorage != null) {
//                catalystLocalStorage.close();
//            }
//
//            if (readableDatabase != null) {
//                readableDatabase.close();
//            }
//        }
//        uuid = Settings.Secure.getString(this.getContentResolver(),
//                Settings.Secure.ANDROID_ID);
//    }
//
//    public String getAsurite() {
//        return asurite;
//    }
//
//    public String getUUID() {
//        return uuid;
//    }

}
