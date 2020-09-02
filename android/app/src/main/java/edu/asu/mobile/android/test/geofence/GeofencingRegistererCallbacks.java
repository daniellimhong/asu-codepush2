package edu.asu.mobile.android.test.geofence;

import com.google.android.gms.common.ConnectionResult;

/**
 * Created by kcoblent on 3/30/18.
 */

public interface GeofencingRegistererCallbacks {
    public void onApiClientConnected();
    public void onApiClientSuspended();
    public void onApiClientConnectionFailed(ConnectionResult connectionResult);

    public void onGeofencesRegisteredSuccessful();
}
