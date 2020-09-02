package edu.asu.mobile.android.test.geofence;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.icu.util.ValueIterator;
import android.preference.PreferenceManager;
import android.support.annotation.NonNull;
import android.util.Log;

import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.Geofence;
import com.google.android.gms.location.GeofencingClient;
import com.google.android.gms.location.GeofencingRequest;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

/**
 * Created by kcoblent on 3/30/18.
 */

public class GeofencingRegisterer {
    private Context mContext;
    private GoogleApiClient mGoogleApiClient;
    private List<Geofence> geofencesToAdd;

    private PendingIntent mGeofencePendingIntent;
    private ArrayList<Geofence> mGeofenceList;
    private GeofencingClient mGeofencingClient;
    private static final int REQUEST_PERMISSIONS_REQUEST_CODE = 34;
    static HashMap<String, LatLng> GEOFENCES = null;
    static HashMap<String,Double> CLOSEST_GEOS = new HashMap<>();
    Map<Integer, String> map =  null;


    public static final double R = 6372.8; // In kilometers


    private GeofencingRegistererCallbacks mCallback;

    public final String TAG = "PUTYOURLEFTFOOTIN";

    public GeofencingRegisterer(Context context) {
        mContext = context;
        mGeofenceList = new ArrayList<>();
        GetGeofences geo = new GetGeofences();
        GEOFENCES = geo.getGeofencesMap();
    }

    public void setGeofencingCallback(GeofencingRegistererCallbacks callback) {
        mCallback = callback;
    }

    public void initGeofences(Double lat,Double lon) {
        Log.e("GEOFENCES INIT: ",lat+", "+lon);
        mGeofenceList = new ArrayList<>();
        mGeofencingClient = LocationServices.getGeofencingClient(mContext);
        mGeofencingClient.removeGeofences(getGeofencePendingIntent());

        organizeGeos(lat,lon);
    }

    private void populateGeofenceList() {

        int count = 0;

        Set set2 = map.entrySet();
        Iterator iterator2 = set2.iterator();
        while(iterator2.hasNext() && count < 100) {
            count++;
            Map.Entry me2 = (Map.Entry)iterator2.next();
            LatLng e = GEOFENCES.get(me2.getKey());
//            e = null;
            if( e != null ) {
                Log.d("GEOFENCEADD: ",e.latitude+":"+e.longitude);
                mGeofenceList.add(new Geofence.Builder()
                        .setRequestId((String) me2.getKey())
                        .setCircularRegion(
                                e.latitude,
                                e.longitude,
                                GeofenceConstants.GEOFENCE_RADIUS_IN_METERS
                        )
                        .setExpirationDuration(GeofenceConstants.GEOFENCE_EXPIRATION_IN_MILLISECONDS)
                        .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER|Geofence.GEOFENCE_TRANSITION_EXIT)
                        .setLoiteringDelay(60000)
                        .build());
            }

        }

        updateGeofencesAdded(true);
        addGeofences();
    }

    private void updateGeofencesAdded(boolean added) {
        PreferenceManager.getDefaultSharedPreferences(mContext)
                .edit()
                .putBoolean(GeofenceConstants.GEOFENCES_ADDED_KEY, added)
                .apply();
    }

    @SuppressWarnings("MissingPermission")
    private void addGeofences() {

        GeofencingRequest geo_req = getGeofencingRequest();

        if( geo_req != null ) {
            mGeofencingClient.addGeofences(geo_req, getGeofencePendingIntent())
                    .addOnSuccessListener(new OnSuccessListener<Void>() {
                        @Override
                        public void onSuccess(Void aVoid) {
                            Log.e(TAG,"Geofence Status: added");
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.e(TAG,"Geofence Status: failed to add "+e);
                        }
                    });
        }


        return;
    }

    private PendingIntent getGeofencePendingIntent() {
        // Reuse the PendingIntent if we already have it.
        if (mGeofencePendingIntent != null) {
            return mGeofencePendingIntent;
        }
        Intent intent = new Intent(mContext, GeofenceBroadcastReceiver.class);
        mGeofencePendingIntent = PendingIntent.getBroadcast(mContext, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
        return mGeofencePendingIntent;
    }

    public boolean getGeofencesAdded() {
        return PreferenceManager.getDefaultSharedPreferences(mContext).getBoolean(
                GeofenceConstants.GEOFENCES_ADDED_KEY, false);
    }

    private GeofencingRequest getGeofencingRequest() {
        GeofencingRequest.Builder builder = new GeofencingRequest.Builder();
        builder.setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER);
        if (mGeofenceList.isEmpty()) {
            return null;
        }
        else {
            builder.addGeofences(mGeofenceList);
            return builder.build();
        }
    }

    public void organizeGeos(Double lat,Double lon) {
        for (Map.Entry<String, LatLng> entry : GEOFENCES.entrySet()) {
            haversine(33.421986, -111.932141,entry.getValue().latitude,entry.getValue().longitude,entry.getKey());
        }

        map = sortByValues(CLOSEST_GEOS);

        populateGeofenceList();

    }

    private static HashMap sortByValues(HashMap map) {
        List list = new LinkedList(map.entrySet());
        Collections.sort(list, new Comparator() {
            public int compare(Object o1, Object o2) {
                return ((Comparable) ((Map.Entry) (o1)).getValue())
                        .compareTo(((Map.Entry) (o2)).getValue());
            }
        });
        HashMap sortedHashMap = new LinkedHashMap();
        for (Iterator it = list.iterator(); it.hasNext();) {
            Map.Entry entry = (Map.Entry) it.next();
            sortedHashMap.put(entry.getKey(), entry.getValue());
        }
        return sortedHashMap;
    }

    public static void haversine(double lat1, double lon1, double lat2, double lon2,String name) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        lat1 = Math.toRadians(lat1);
        lat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        double c = 2 * Math.asin(Math.sqrt(a));
        double result =  R * c * 1000;
        CLOSEST_GEOS.put(name, result);
    }

}
