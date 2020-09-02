package edu.asu.mobile.android.test.location;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import static java.lang.Double.parseDouble;

public class NearestCampus {

    static final HashMap<String, String> ASU_CAMPUS_CENTERS = new HashMap<>();

    public NearestCampus() {
        ASU_CAMPUS_CENTERS.put("Tempe", "33.421538,-111.933636,1200");
        ASU_CAMPUS_CENTERS.put("Downtown", "33.453473,-112.073175,590");
        ASU_CAMPUS_CENTERS.put("Poly", "33.306978,-111.676700,535");
        ASU_CAMPUS_CENTERS.put("West", "33.608272,-112.160940,835");
    }

    public String insideCampus(double lat, double lon) {
        String campus = null;
        Iterator it = ASU_CAMPUS_CENTERS.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry pair = (Map.Entry)it.next();
            List<String> itemDistances = Arrays.asList(pair.getValue().toString().split(","));
            double distanceDiff = distance(lat,lon,parseDouble(itemDistances.get(0)), parseDouble(itemDistances.get(1)));
            if( parseDouble(itemDistances.get(2)) > distanceDiff ) {
                campus = pair.getKey().toString();
            }
        }

        return campus;
    }

    private double distance(double lat1, double lng1, double lat2, double lng2) {

        double earthRadius = 6371 * 1000; // in miles, change to 6371 for kilometer output

        double dLat = Math.toRadians(lat2-lat1);
        double dLng = Math.toRadians(lng2-lng1);

        double sindLat = Math.sin(dLat / 2);
        double sindLng = Math.sin(dLng / 2);

        double a = Math.pow(sindLat, 2) + Math.pow(sindLng, 2)
                * Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2));

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        double dist = earthRadius * c;

        return dist; // output distance, in METERS

    }


}
