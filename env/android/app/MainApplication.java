package edu.asu.mobile.android.test;

import android.app.Application;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import edu.asu.mobile.android.test.geofence.GeofencePackage;
import edu.asu.mobile.android.test.location.LocationPackage;
import com.facebook.react.ReactApplication;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import edu.asu.push.ReactNativePushNotificationPackage;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.amazonaws.RNAWSCognitoPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;


import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    Cursor catalystLocalStorage = null;
    SQLiteDatabase readableDatabase = null;
    String username = "";
    String android_id = "";

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage(),
            new ReactNativePushNotificationPackage(),
            new CookieManagerPackage(),
            new RNAWSCognitoPackage(),
            new GeofencePackage(),
            new LocationPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {

    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    Log.d("GEOFENCE TAG","INSIDE ONCREATE");
    initAsuriteAndUUID();

  }

    private void initAsuriteAndUUID() {
      //Grab asurite from react async storage
        try {
            readableDatabase = ReactDatabaseSupplier.getInstance(this).getReadableDatabase();
            catalystLocalStorage = readableDatabase.query("catalystLocalStorage", new String[]{"value"}, "key = ?", new String[] { "username" }, null, null, null);
            if( catalystLocalStorage != null && catalystLocalStorage.moveToFirst() ) {
                final String value = catalystLocalStorage.getString(catalystLocalStorage.getColumnIndex("value"));
                UserInfo.asurite = value;
                Log.e("USERNAME",value);
            } else {
                Log.e("CURSOR","CURSOR NULL");
            }

        } finally {
            if (catalystLocalStorage != null) {
                catalystLocalStorage.close();
            }

            if (readableDatabase != null) {
                readableDatabase.close();
            }
        }
        //getuuid from system
        UserInfo.uuid = Settings.Secure.getString(getContentResolver(),
                Settings.Secure.ANDROID_ID);

    }

}
