/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "RNNotificationActions.h"
#import <React/RCTBridge.h>

#import <React/RCTBundleURLProvider.h>

#import <React/RCTPushNotificationManager.h>
#import <React/RCTRootView.h>
#import <CoreLocation/CoreLocation.h>
#import <UserNotifications/UserNotifications.h>
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import "RNSplashScreen.h"
#import <React/RCTLinkingManager.h>


@implementation AppDelegate
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

@class LocationService;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  [UIApplication sharedApplication].applicationIconBadgeNumber=0;

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                      moduleName:@"asumobileapp"
                                               initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  
  if (@available(iOS 13.0, *)) {
    NSLog(@"HITTING 13");
    rootViewController.overrideUserInterfaceStyle = UIUserInterfaceStyleLight;
    [[UIApplication sharedApplication] setStatusBarStyle:UIStatusBarStyleDarkContent];
  }
  
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [Fabric with:@[[Crashlytics class]]];
#ifdef DEBUG
#else
  [RNSplashScreen show];
#endif
  return YES;
}


// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
  [RNNotificationActions setCategories];
  
  NSLog(@"HITTING TOKEN %@",deviceToken);
  
  _pushRegistry = [[PKPushRegistry
                    alloc] initWithQueue:dispatch_get_main_queue()];
  _pushRegistry.delegate = self;
  _pushRegistry.desiredPushTypes = [NSSet setWithObject:PKPushTypeVoIP];
  
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  
  NSLog(@"APPDELEGATE: didReceiveRemoteNotification %@", userInfo);
  NSLog(@"RECEIVED NOTIFICATION");
  
}

// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  
  NSString* sendType = [[userInfo objectForKey:@"aps"] objectForKey:@"apns-push-type"];
  NSLog(@"HItting here 123 %@",sendType);
  
  if( [sendType length] > 0 && [sendType isEqualToString:@"background"] ) {
    
    RNNotificationActions* inst = [RNNotificationActions allocWithZone:nil];
    [inst handleSilentNotification:userInfo];
    
  } else {
  
    [RCTPushNotificationManager didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
  
    if (application.applicationState == UIApplicationStateActive ) {
      
      _currUserInfo = userInfo;
  
      NSString *notifTitle = [[[userInfo objectForKey:@"aps"] objectForKey:@"alert"] objectForKey:@"title"];
      
      if( notifTitle ) {
        //Define notifView as UIView in the header file
        [_notifView removeFromSuperview]; //If already existing
        _notifView = [[UIView alloc] initWithFrame:CGRectMake(0, self.window.frame.size.height, self.window.frame.size.width, 80)];

        UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake(10,15,30,30)];
        imageView.image = [UIImage imageNamed:@"AppLogo.png"];
    
        UILabel *myLabel = [[UILabel alloc] initWithFrame:CGRectMake(60, 15, self.window.frame.size.width - 100 , 30)];
        myLabel.font = [UIFont fontWithName:@"Helvetica" size:11.0];
        myLabel.text = [NSString stringWithFormat: @"%@%@", @"   ",notifTitle];
        myLabel.center = CGPointMake(_notifView.frame.size.width / 2, _notifView.frame.size.height / 2);
        
        myLabel.backgroundColor = [UIColor colorWithRed:(0/255.0) green:(161.0/255.0) blue:(226.0/255.0) alpha:1];
        
        myLabel.layer.masksToBounds = YES;
        myLabel.layer.cornerRadius = 15;
    
        [myLabel setTextColor:[UIColor whiteColor]];
        [myLabel setNumberOfLines:0];
    
        [_notifView setAlpha:0.95];
    
        //The Icon
        [_notifView addSubview:imageView];
    
        //The Text
        [_notifView addSubview:myLabel];
    
        //The View
        [self.window addSubview:_notifView];
    
        UITapGestureRecognizer *tapToDismissNotif = [[UITapGestureRecognizer alloc] initWithTarget:self
                                                                                            action:@selector(dismissNotifFromScreen:)];
        tapToDismissNotif.numberOfTapsRequired = 1;
        tapToDismissNotif.numberOfTouchesRequired = 1;
    
        [_notifView addGestureRecognizer:tapToDismissNotif];
    
    
        [UIView animateWithDuration:1.0 delay:.1 usingSpringWithDamping:0.5 initialSpringVelocity:0.1 options:UIViewAnimationOptionCurveEaseIn animations:^{
    
          [_notifView setFrame:CGRectMake(0, self.window.frame.size.height - 100, self.window.frame.size.width, 60)];
    
        } completion:^(BOOL finished) {
    
    
        }];
    
        //Remove from top view after 5 seconds
        [self performSelector:@selector(dismissNotifFromScreen:) withObject:@"YES" afterDelay:5.0];
      }
      
  
    }
  }
  
}

- (void)dismissNotifFromScreen:(NSString *) delayed{
  
  NSLog(@"Dismissing: %@",_currUserInfo);
  NSLog(@"Dismissing Type Check: %s",[delayed isKindOfClass:[NSString class]] ? "true" : "false");
  
  if( ![delayed isKindOfClass:[NSString class]] && _currUserInfo != nil ) {
    NSLog(@"Dismissing: Hey look Ma, I made it");
    RNNotificationActions* inst = [RNNotificationActions allocWithZone:nil];
    [inst handleTap:_currUserInfo];

  }
  
  _currUserInfo = nil;
  
  [UIView animateWithDuration:1.0 delay:.1 usingSpringWithDamping:0.5 initialSpringVelocity:0.1 options:UIViewAnimationOptionCurveEaseIn animations:^{
    
    [_notifView setFrame:CGRectMake(0, self.window.frame.size.height, self.window.frame.size.width, 60)];
    
  } completion:^(BOOL finished) {
    
    
  }];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forRemoteNotification:(NSDictionary *)userInfo withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)())completionHandler
{
  application.applicationIconBadgeNumber = 0;
  [RNNotificationActions application:application handleActionWithIdentifier:identifier forRemoteNotification:userInfo withResponseInfo:responseInfo completionHandler:completionHandler];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  application.applicationIconBadgeNumber = 0;
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  NSLog(@"IN HEREE");
  
}

- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(NSString *)type{
  
  if([credentials.token length] == 0) {
    NSLog(@"voip token NULL");
    return;
  }
  
  NSData* deviceToken = credentials.token;
  NSUInteger length = [credentials.token length];

  const unsigned char *buffer = deviceToken.bytes;
  NSMutableString *hexString  = [NSMutableString stringWithCapacity:(length * 2)];
  for (int i = 0; i < length; ++i) {
      [hexString appendFormat:@"%02x", buffer[i]];
  }
  
  [RNNotificationActions saveVoIPToken:[hexString copy]];
  
}

- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(NSString *)type
{
  NSLog(@"didReceiveIncomingPushWithPayload %@",payload.dictionaryPayload);
  
  //  sendToReact
  RNNotificationActions* inst = [RNNotificationActions allocWithZone:nil];
  [inst handleSilentNotification:payload.dictionaryPayload];
  
}
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void) goToNativeView {
  NSLog(@"RN binding - Native View - MyViewController.swift - Load From main storyboard");
  UIViewController *vc =  [UIStoryboard storyboardWithName:@"Main" bundle:nil].instantiateInitialViewController;
  UINavigationController* navigationController = [[UINavigationController alloc] initWithRootViewController:vc];

  dispatch_async(dispatch_get_main_queue(), ^{
    [self.window.rootViewController presentViewController:navigationController animated:true completion:NULL];
  });
}

//- (void) goToNativeView {
// UIViewController *vc =  [InitialViewController new];// This is your native iOS VC
// UINavigationController* navigationController = [[UINavigationController alloc] initWithRootViewController:vc];
//
//  dispatch_async(dispatch_get_main_queue(), ^{
//   // Never do the below, it will be difficult to come back to react-native
//
//   // self.window.rootViewController = navigationController;
//
//    // Do this instead
//    [self.window.rootViewController presentViewController:navigationController animated:true completion:NULL];
//  });
//}

@end
