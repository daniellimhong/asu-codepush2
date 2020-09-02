@import UIKit;

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNNotificationActions : RCTEventEmitter <RCTBridgeModule>

+ (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forRemoteNotification:(NSDictionary *)userInfo withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)())completionHandler;
+ (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forLocalNotification:(UILocalNotification *)notification withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)())completionHandler;
+ (void)setCategories;
- (void)handleSilentNotification:(NSDictionary *)info;
- (void)handleTap:(NSDictionary *)info;
+ (void)saveVoIPToken:(NSString *)token;
+ (id)allocWithZone:(struct _NSZone *)zone;
//- (void)executeAPICall:(NSDictionary *) payload givenurl:(NSString *)givenurl;

@end


