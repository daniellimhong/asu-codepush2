package edu.asu.mobile.android.test.geofence;

import android.os.AsyncTask;
import android.util.Log;

import com.google.android.gms.maps.model.LatLng;

import org.json.JSONArray;
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
import java.util.HashMap;

import javax.net.ssl.HttpsURLConnection;

import edu.asu.mobile.android.test.UserInfo;

import static java.lang.Float.parseFloat;

public class GetGeofences {

    private String TAG = "GETTING GEOFENCES";
    String urlString = "https://vgzft54oy9.execute-api.us-west-2.amazonaws.com/prod/geofence";
    String operation = "getGeofences";
    final HashMap<String, LatLng> geofences = new HashMap<>();

    public GetGeofences() {
        new CallAPI().doInBackground();
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

            OutputStream out = null;
            URL url;
            String response = "";
            BufferedWriter writer = null;
            OutputStream os = null;
            BufferedReader responseStreamReader = null;
            InputStream responseStream = null;

            try {

                JSONObject postDataParams = new JSONObject();
                postDataParams.put("operation", operation);
                postDataParams.put("dUUID", UserInfo.uuid);
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
//                Log.e(TAG,"POST DATA "+url+getPostDataString(postDataParams));
                writer.write(postDataParams.toString());

                writer.flush();

                int responseCode=conn.getResponseCode();
                Log.e(TAG,String.valueOf(responseCode));

                if (responseCode == HttpsURLConnection.HTTP_OK) {
//                    Log.e(TAG,"successfully posted location ");
                    Log.e("GETTING GEOFENCES HERE",os.toString());
                    responseStream = new BufferedInputStream(conn.getInputStream());
                    responseStreamReader = new BufferedReader(new InputStreamReader(responseStream));
                    String line = "";
                    StringBuilder stringBuilder = new StringBuilder();
                    while ((line = responseStreamReader.readLine()) != null) {
                        stringBuilder.append(line);
                    }

                    String response2 = stringBuilder.toString();
                    JSONArray jsonResponse = new JSONArray(response2);


                    for(int i=0; i<jsonResponse.length(); i++){
                        JSONObject item = jsonResponse.getJSONObject(i);
                        String id = item.getString("id");
                        float lat = parseFloat(item.getString("lat"));
                        float lon = parseFloat(item.getString("lon"));
                        geofences.put(id, new LatLng(lat,lon));
                    }

                    Log.e("GEOFENCES LENGTH", String.valueOf(geofences.size()));
                }

                try {
                    writer.close();
                    os.close();
                    responseStreamReader.close();
                    responseStream.close();
                    conn.disconnect();
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

    public HashMap getGeofencesMap() {
        return geofences;
    }
}
