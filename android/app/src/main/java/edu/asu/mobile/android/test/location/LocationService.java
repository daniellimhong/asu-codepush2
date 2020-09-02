package edu.asu.mobile.android.test.location;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.location.Location;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.IBinder;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

import edu.asu.mobile.android.test.UserInfo;
import edu.asu.mobile.android.test.geofence.GeofencingRegisterer;

import com.facebook.react.modules.storage.ReactDatabaseSupplier;

import org.json.JSONObject;

import java.io.BufferedWriter;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.net.ssl.HttpsURLConnection;

import static java.lang.Double.parseDouble;

public class LocationService extends Service {
    Cursor catalystLocalStorage = null;
    SQLiteDatabase readableDatabase = null;

    String asurite = "";
    String uuid = "";

    String url = "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/geofence";
//    String url = "https://cwnk5c6i9g.execute-api.us-east-1.amazonaws.com/prod/geofence";

    private static final String TAG = "WAZOWSKI";
    private LocationManager mLocationManager = null;
    private static final int LOCATION_INTERVAL = 60000;
    private static final float LOCATION_DISTANCE = 0;
    Context context;

    private class LocationListener implements android.location.LocationListener
    {
        Location mLastLocation;

        public LocationListener(String provider)
        {
            Log.e(TAG, "LocationListener " + provider);
            mLastLocation = new Location(provider);
            Log.e("LAST LOCATION",String.valueOf(mLastLocation.getLatitude())+" " + String.valueOf(mLastLocation.getLongitude()));
        }

        @Override
        public void onLocationChanged(Location location)
        {
            Log.e(TAG, "onLocationChanged: " + location);
            mLastLocation.set(location);

            String user= UserInfo.asurite;
            String uuid= UserInfo.uuid;

            String latitude = String.valueOf(location.getLatitude());
            String longitude = String.valueOf(location.getLongitude());
            new CallAPI().execute(url,user,uuid,latitude,longitude);


        }

        @Override
        public void onProviderDisabled(String provider)
        {
            Log.e(TAG, "onProviderDisabled: " + provider);
        }

        @Override
        public void onProviderEnabled(String provider)
        {
            Log.e(TAG, "onProviderEnabled: " + provider);
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras)
        {
            Log.e(TAG, "onStatusChanged: " + provider);
        }
    }

    LocationListener[] mLocationListeners = new LocationListener[] {
            new LocationListener(LocationManager.PASSIVE_PROVIDER)
    };

    @Override
    public IBinder onBind(Intent arg0)
    {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId)
    {
        Log.e(TAG, "onStartCommand");
        super.onStartCommand(intent, flags, startId);
        return START_STICKY;
    }

    @Override
    public void onCreate()
    {
        super.onCreate();
        Log.e(TAG, "onCreate");

        context = this;

        initializeLocationManager();

        try {
            mLocationManager.requestLocationUpdates(
                    LocationManager.PASSIVE_PROVIDER,
                    LOCATION_INTERVAL,
                    LOCATION_DISTANCE,
                    mLocationListeners[0]
            );
        } catch (java.lang.SecurityException ex) {
            Log.i(TAG, "fail to request location update, ignore", ex);
        } catch (IllegalArgumentException ex) {
            Log.d(TAG, "network provider does not exist, " + ex.getMessage());
        }
    }

//    @Override
//    public void onDestroy() {
//        Log.e(TAG, "onDestroy");
//    }

    private void initializeLocationManager() {
        Log.e(TAG, "initializeLocationManager");
        if (mLocationManager == null) {
            mLocationManager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
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

            String urlString = params[0]; // URL to call
            String user = params[1]; //data to post
            String uuid = params[2];
            double lat = Double.parseDouble(params[3]);
            double lon = Double.parseDouble(params[4]);
            String campus = new NearestCampus().insideCampus(lat,lon);

            URL url;
            BufferedWriter writer = null;
            HttpURLConnection conn = null;

//            GeofencingRegisterer geo = new GeofencingRegisterer(context);
//            geo.initGeofences(lat,lon);
//            geo.getGeofencesAdded();

            try {
                JSONObject postDataParams = new JSONObject();
                postDataParams.put("operation", "writeLocation");
                postDataParams.put("platform", "Android");
                postDataParams.put("type", "passive");
                postDataParams.put("latitude", lat);
                postDataParams.put("longitude", lon);
                postDataParams.put("campus", campus);
                postDataParams.put("dUUID", uuid);
                Log.e("params",postDataParams.toString());

                url = new URL(urlString);

                conn = (HttpURLConnection) url.openConnection();
                //Timeouts are set high to accommodate 3G networks
                conn.setReadTimeout(120000);
                conn.setConnectTimeout(120000);
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-type", "application/x-www-form-urlencoded");
                conn.setDoOutput(true);

                writer = new BufferedWriter(new OutputStreamWriter(conn.getOutputStream(), "UTF-8"));
                Log.e(TAG,"POST DATA "+url+getPostDataString(postDataParams));
                writer.write(postDataParams.toString());

                writer.close();

                int responseCode=conn.getResponseCode();
                String resp = conn.getResponseMessage();
                conn.disconnect();
                Log.e(TAG,String.valueOf(responseCode));
                Log.e(TAG,resp);

                if (responseCode == HttpsURLConnection.HTTP_OK) {
                    Log.e(TAG,"successfully posted location ");
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

}