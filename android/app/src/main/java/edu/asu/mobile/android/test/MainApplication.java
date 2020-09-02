package edu.asu.mobile.android.test;

import android.app.Application;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.provider.Settings;
import android.util.Log;
import android.content.Context;

import com.facebook.react.modules.storage.ReactDatabaseSupplier;

import edu.asu.mobile.android.test.customview.IVSManager;
import edu.asu.mobile.android.test.customview.IVSPackage;
import edu.asu.mobile.android.test.geofence.GeofencePackage;
import edu.asu.mobile.android.test.location.LocationPackage;
import com.facebook.react.ReactApplication;
import codes.simen.IMEI.IMEI;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.horcrux.svg.SvgPackage;
import com.calendarevents.CalendarEventsPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.cubicphuse.RCTTorch.RCTTorchPackage;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.showlocationservicesdialogbox.LocationServicesDialogBoxPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import edu.asu.push.ReactNativePushNotificationPackage;
import com.psykar.cookiemanager.CookieManagerPackage;
import com.amazonaws.RNAWSCognitoPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.shell.MainPackageConfig;
import com.facebook.imagepipeline.core.ImagePipelineConfig;
import com.facebook.soloader.SoLoader;
import com.smixx.fabric.FabricPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import android.webkit.WebView;

import com.microsoft.codepush.react.CodePush;

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
     protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
    }

    @Override
    protected List<ReactPackage> getPackages() {
        Context context = getApplicationContext();

        // This is the Fresco config, do anything custom you want here
        ImagePipelineConfig frescoConfig = ImagePipelineConfig
                .newBuilder(context)
                .setBitmapMemoryCacheParamsSupplier(new CustomBitmapMemoryCacheParamsSupplier(context))
                .build();

        MainPackageConfig appConfig = new MainPackageConfig
                .Builder()
                .setFrescoConfig(frescoConfig)
                .build();

      return Arrays.<ReactPackage>asList(
          new MainReactPackage(appConfig),
            new CodePush("BypvoXY3yCIMYldnP2Ulas50wWxtr1i_UX07V", MainApplication.this, BuildConfig.DEBUG),
            new NetInfoPackage(),
            new LinearGradientPackage(),
            new LocationServicesDialogBoxPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage(),
            new ReactNativePushNotificationPackage(),
            new CookieManagerPackage(),
            new RNAWSCognitoPackage(),
            new GeofencePackage(),
            new LocationPackage(),
            new RCTTorchPackage(),
              new IVSPackage(),
            new GoogleAnalyticsBridgePackage(),
            new RNExitAppPackage(),
            new FabricPackage(),
            new RNSensitiveInfoPackage(),
            new SplashScreenReactPackage(),
            new RNGestureHandlerPackage(),
            new RNCWebViewPackage(),
            new CalendarEventsPackage(),
            new SvgPackage(),
              new ReactNativeRestartPackage()
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
    Fabric.with(this, new Crashlytics());
    WebView.setWebContentsDebuggingEnabled(true);
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

        UserInfo.lastTimeUpdate = new Date();

    }

}
