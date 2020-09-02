@import UIKit;
#import "RNNotificationActions.h"
#import "RNNotificationActionsManager.h"
#import <UserNotifications/UserNotifications.h>

#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import <React/RCTUtils.h>
#import <RNDeviceInfo/DeviceUID.h>

#import <sys/utsname.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreLocation/CoreLocation.h>

NSString *const RNNotificationActionReceived = @"NotificationActionReceived";

@implementation RCTConvert (UIUserNotificationActivationMode)
RCT_ENUM_CONVERTER(UIUserNotificationActivationMode, (
                                                      @{
                                                        @"foreground": @(UIUserNotificationActivationModeForeground),
                                                        @"background": @(UIUserNotificationActivationModeBackground),
                                                        }), UIUserNotificationActivationModeForeground, integerValue)
@end

@implementation RCTConvert (UIUserNotificationActionBehavior)
RCT_ENUM_CONVERTER(UIUserNotificationActionBehavior, (
                                                      @{
                                                        @"default": @(UIUserNotificationActionBehaviorDefault),
                                                        @"textInput": @(UIUserNotificationActionBehaviorTextInput),
                                                        }), UIUserNotificationActionBehaviorDefault, integerValue)
@end

@implementation RCTConvert (UIUserNotificationActionContext)
RCT_ENUM_CONVERTER(UIUserNotificationActionContext, (
                                                     @{
                                                       @"default": @(UIUserNotificationActionContextDefault),
                                                       @"minimal": @(UIUserNotificationActionContextMinimal),
                                                       }), UIUserNotificationActionContextDefault, integerValue)
@end

@implementation RNNotificationActions

CLLocationManager *locationManager;


NSString *testUrl = @"https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev/test";
NSString *tokenUrl = @"https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev/tokenpref-test";


RCT_EXPORT_MODULE();

//@synthesize bridge = _bridge;

- (id)init
{
  if (self = [super init]) {
    return self;
  } else {
    return nil;
  }
}

+ (id)allocWithZone:(NSZone *)zone {
  static RNNotificationActions *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"notificationSilentReceived",@"notificationReplyReceived",@"notificationActionReceived",@"NotificationActionReceived",@"inappNotificationTapped"];
}

- (void)startObserving {
  NSLog(@"Starting observation");
  NSNotificationCenter *center = [NSNotificationCenter defaultCenter];
  for (NSString *notificationName in [self supportedEvents]) {
    [center addObserver:self
               selector:@selector(handleNotificationActionReceived:)
                   name:notificationName
                 object:nil];
  }
}

- (void)stopObserving {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (UIMutableUserNotificationAction *)actionFromJSON:(NSDictionary *)opts
{
  UIMutableUserNotificationAction *action;
  action = [[UIMutableUserNotificationAction alloc] init];
  [action setActivationMode: [RCTConvert UIUserNotificationActivationMode:opts[@"activationMode"]]];
  [action setBehavior: [RCTConvert UIUserNotificationActionBehavior:opts[@"behavior"]]];
  [action setTitle:opts[@"title"]];
  [action setIdentifier:opts[@"identifier"]];
  [action setDestructive:[RCTConvert BOOL:opts[@"destructive"]]];
  [action setAuthenticationRequired:[RCTConvert BOOL:opts[@"authenticationRequired"]]];
  return action;
}

- (UIUserNotificationCategory *)categoryFromJSON:(NSDictionary *)json
{
  UIMutableUserNotificationCategory *category;
  category = [[UIMutableUserNotificationCategory alloc] init];
  [category setIdentifier:[RCTConvert NSString:json[@"identifier"]]];
  
  // Get the actions from the category
  NSMutableArray *actions;
  actions = [[NSMutableArray alloc] init];
  for (NSDictionary *actionJSON in [RCTConvert NSArray:json[@"actions"]]) {
    [actions addObject:[self actionFromJSON:actionJSON]];
  }
  
  // Set these actions for this context
  [category setActions:actions
            forContext:[RCTConvert UIUserNotificationActionContext:json[@"context"]]];
  return category;
}

+ (void)setCategories
{
  
  NSLog(@"STARTING SET CATS TOKEN");
  
  UNTextInputNotificationAction* replyInLine = [UNTextInputNotificationAction
                                                actionWithIdentifier:@"Reply"
                                                title:@"Reply"
                                                options:UNNotificationActionOptionNone];
  
  
  UNNotificationAction* acceptAction = [UNNotificationAction
                                        actionWithIdentifier:@"Accept"
                                        title:@"Accept"
                                        options:UNNotificationActionOptionNone];
  
  
  UNNotificationAction* activateAction = [UNNotificationAction
                                          actionWithIdentifier:@"Activate"
                                          title:@"Activate"
                                          options:UNNotificationActionOptionNone];
  
  
  UNNotificationAction* allowAction = [UNNotificationAction
                                       actionWithIdentifier:@"Allow"
                                       title:@"Allow"
                                       options:UNNotificationActionOptionNone];
  
  UNNotificationAction* asu101Action = [UNNotificationAction
                                        actionWithIdentifier:@"ASU101"
                                        title:@"ASU 101"
                                        options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* awesomeAction = [UNNotificationAction
                                         actionWithIdentifier:@"Awesome"
                                         title:@"Awesome"
                                         options:UNNotificationActionOptionNone];
  
  
  UNNotificationAction* callAction = [UNNotificationAction
                                      actionWithIdentifier:@"Call"
                                      title:@"Call"
                                      options:UNNotificationActionOptionForeground];
  
  
  UNNotificationAction* callcoachnowAction = [UNNotificationAction
                                              actionWithIdentifier:@"CallCoachNow"
                                              title:@"Call Coach Now"
                                              options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* chatAction = [UNNotificationAction
                                      actionWithIdentifier:@"Chat"
                                      title:@"Chat"
                                      options:UNNotificationActionOptionForeground];
  
  
  UNNotificationAction* denyAction = [UNNotificationAction
                                      actionWithIdentifier:@"Deny"
                                      title:@"Deny"
                                      options:UNNotificationActionOptionNone];
  
  
  UNNotificationAction* dontallowAction = [UNNotificationAction
                                           actionWithIdentifier:@"DontAllow"
                                           title:@"Don't Allow"
                                           options:UNNotificationActionOptionNone];
  
  UNNotificationAction* doneAction = [UNNotificationAction
                                      actionWithIdentifier:@"Done"
                                      title:@"Done"
                                      options:UNNotificationActionOptionNone];
  
  UNNotificationAction* emailAction = [UNNotificationAction
                                       actionWithIdentifier:@"Email"
                                       title:@"Email"
                                       options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* ignoreAction = [UNNotificationAction
                                        actionWithIdentifier:@"Ignore"
                                        title:@"Ignore"
                                        options:UNNotificationActionOptionNone];
  
  UNNotificationAction* wantAction = [UNNotificationAction
                                      actionWithIdentifier:@"WantToGo"
                                      title:@"I Want To Go"
                                      options:UNNotificationActionOptionNone];
  
  UNNotificationAction* likelyAction = [UNNotificationAction
                                        actionWithIdentifier:@"Likely"
                                        title:@"Likely"
                                        options:UNNotificationActionOptionNone];
  
  UNNotificationAction* loginAction = [UNNotificationAction
                                       actionWithIdentifier:@"Login"
                                       title:@"Login"
                                       options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* moreInfoAction = [UNNotificationAction
                                          actionWithIdentifier:@"MoreInformation"
                                          title:@"More Information"
                                          options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* noAction = [UNNotificationAction
                                    actionWithIdentifier:@"No"
                                    title:@"No"
                                    options:UNNotificationActionOptionNone];
  
  UNNotificationAction* notIntAction = [UNNotificationAction
                                        actionWithIdentifier:@"NotInterested"
                                        title:@"Not Interested"
                                        options:UNNotificationActionOptionNone];
  
  UNNotificationAction* notnowAction = [UNNotificationAction
                                        actionWithIdentifier:@"NotNow"
                                        title:@"Not Now"
                                        options:UNNotificationActionOptionNone];
  
  UNNotificationAction* okayAction = [UNNotificationAction
                                      actionWithIdentifier:@"Okay"
                                      title:@"Okay"
                                      options:UNNotificationActionOptionNone];
  
  UNNotificationAction* okayOpenAction = [UNNotificationAction
                                          actionWithIdentifier:@"Okay"
                                          title:@"Okay"
                                          options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* openAction = [UNNotificationAction
                                      actionWithIdentifier:@"OpenLink"
                                      title:@"Open Link"
                                      options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* orientationAction = [UNNotificationAction
                                             actionWithIdentifier:@"Orientation"
                                             title:@"Orientation"
                                             options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* registerAction = [UNNotificationAction
                                          actionWithIdentifier:@"Register"
                                          title:@"Register"
                                          options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* rejectAction = [UNNotificationAction
                                        actionWithIdentifier:@"Reject"
                                        title:@"Reject"
                                        options:UNNotificationActionOptionNone];
  
  UNNotificationAction* respondAction = [UNNotificationAction
                                         actionWithIdentifier:@"Respond"
                                         title:@"Respond"
                                         options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* sharenowAction = [UNNotificationAction
                                          actionWithIdentifier:@"ShareNow"
                                          title:@"Share Now"
                                          options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* unlikelyAction = [UNNotificationAction
                                          actionWithIdentifier:@"Unlikely"
                                          title:@"Unlikely"
                                          options:UNNotificationActionOptionNone];
  
  UNNotificationAction* takemethereAction = [UNNotificationAction
                                             actionWithIdentifier:@"TakeMeThere"
                                             title:@"Take Me There"
                                             options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* learnmoreAction = [UNNotificationAction
                                           actionWithIdentifier:@"LearnMore"
                                           title:@"Learn More"
                                           options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* yesAction = [UNNotificationAction
                                     actionWithIdentifier:@"Yes"
                                     title:@"Yes"
                                     options:UNNotificationActionOptionNone];
  
  UNNotificationAction* yesOpenAction = [UNNotificationAction
                                         actionWithIdentifier:@"Yes"
                                         title:@"Yes"
                                         options:UNNotificationActionOptionForeground];
  
  UNNotificationAction* openAppAction = [UNNotificationAction
                                         actionWithIdentifier:@"OpenApp"
                                         title:@"Open App"
                                         options:UNNotificationActionOptionForeground];
  
  // Create the category with the custom actions.
  
  UNNotificationCategory* inlineReply = [UNNotificationCategory
                                         categoryWithIdentifier:@"replyinline"
                                         actions:@[replyInLine]
                                         intentIdentifiers:@[]
                                         options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* accept = [UNNotificationCategory
                                    categoryWithIdentifier:@"accept"
                                    actions:@[acceptAction]
                                    intentIdentifiers:@[]
                                    options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* acceptdeny = [UNNotificationCategory
                                        categoryWithIdentifier:@"acceptdeny"
                                        actions:@[acceptAction, denyAction]
                                        intentIdentifiers:@[]
                                        options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* acceptreject = [UNNotificationCategory
                                          categoryWithIdentifier:@"acceptreject"
                                          actions:@[acceptAction, rejectAction]
                                          intentIdentifiers:@[]
                                          options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* acceptignore = [UNNotificationCategory
                                          categoryWithIdentifier:@"acceptignore"
                                          actions:@[acceptAction, ignoreAction]
                                          intentIdentifiers:@[]
                                          options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* activate = [UNNotificationCategory
                                      categoryWithIdentifier:@"activate"
                                      actions:@[activateAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* allow = [UNNotificationCategory
                                   categoryWithIdentifier:@"allow"
                                   actions:@[allowAction]
                                   intentIdentifiers:@[]
                                   options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* allowdont = [UNNotificationCategory
                                       categoryWithIdentifier:@"allowdont"
                                       actions:@[allowAction, dontallowAction]
                                       intentIdentifiers:@[]
                                       options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* asu101 = [UNNotificationCategory
                                    categoryWithIdentifier:@"asu101"
                                    actions:@[asu101Action]
                                    intentIdentifiers:@[]
                                    options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* awesome = [UNNotificationCategory
                                     categoryWithIdentifier:@"awesome"
                                     actions:@[awesomeAction]
                                     intentIdentifiers:@[]
                                     options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* awesomenot = [UNNotificationCategory
                                        categoryWithIdentifier:@"awesomenot"
                                        actions:@[awesomeAction, notIntAction]
                                        intentIdentifiers:@[]
                                        options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* call = [UNNotificationCategory
                                  categoryWithIdentifier:@"call"
                                  actions:@[callAction]
                                  intentIdentifiers:@[]
                                  options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* callreject = [UNNotificationCategory
                                        categoryWithIdentifier:@"callreject"
                                        actions:@[callAction,rejectAction]
                                        intentIdentifiers:@[]
                                        options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* callcoach = [UNNotificationCategory
                                       categoryWithIdentifier:@"callcoach"
                                       actions:@[callcoachnowAction]
                                       intentIdentifiers:@[]
                                       options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* chat = [UNNotificationCategory
                                  categoryWithIdentifier:@"chat"
                                  actions:@[chatAction]
                                  intentIdentifiers:@[]
                                  options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* chatcall = [UNNotificationCategory
                                      categoryWithIdentifier:@"chatcall"
                                      actions:@[chatAction, callcoachnowAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* deny = [UNNotificationCategory
                                  categoryWithIdentifier:@"deny"
                                  actions:@[denyAction]
                                  intentIdentifiers:@[]
                                  options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* dont = [UNNotificationCategory
                                  categoryWithIdentifier:@"dont"
                                  actions:@[dontallowAction]
                                  intentIdentifiers:@[]
                                  options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* done = [UNNotificationCategory
                                  categoryWithIdentifier:@"done"
                                  actions:@[doneAction]
                                  intentIdentifiers:@[]
                                  options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* donenot = [UNNotificationCategory
                                     categoryWithIdentifier:@"donenot"
                                     actions:@[doneAction, notnowAction]
                                     intentIdentifiers:@[]
                                     options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* email = [UNNotificationCategory
                                   categoryWithIdentifier:@"email"
                                   actions:@[emailAction]
                                   intentIdentifiers:@[]
                                   options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* emailcall = [UNNotificationCategory
                                       categoryWithIdentifier:@"emailcall"
                                       actions:@[emailAction,callAction]
                                       intentIdentifiers:@[]
                                       options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* wanttogo = [UNNotificationCategory
                                      categoryWithIdentifier:@"wanttogo"
                                      actions:@[wantAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* wantnot = [UNNotificationCategory
                                     categoryWithIdentifier:@"wantnot"
                                     actions:@[wantAction, notIntAction]
                                     intentIdentifiers:@[]
                                     options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* likely = [UNNotificationCategory
                                    categoryWithIdentifier:@"likely"
                                    actions:@[likelyAction]
                                    intentIdentifiers:@[]
                                    options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* likelyunlikely = [UNNotificationCategory
                                            categoryWithIdentifier:@"likelyunlikely"
                                            actions:@[likelyAction, unlikelyAction]
                                            intentIdentifiers:@[]
                                            options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* login = [UNNotificationCategory
                                   categoryWithIdentifier:@"login"
                                   actions:@[loginAction]
                                   intentIdentifiers:@[]
                                   options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* moreinfo = [UNNotificationCategory
                                      categoryWithIdentifier:@"moreinfo"
                                      actions:@[moreInfoAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* no = [UNNotificationCategory
                                categoryWithIdentifier:@"no"
                                actions:@[noAction]
                                intentIdentifiers:@[]
                                options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* notint = [UNNotificationCategory
                                    categoryWithIdentifier:@"notint"
                                    actions:@[notIntAction]
                                    intentIdentifiers:@[]
                                    options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* notnow = [UNNotificationCategory
                                    categoryWithIdentifier:@"notnow"
                                    actions:@[notnowAction]
                                    intentIdentifiers:@[]
                                    options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* okay = [UNNotificationCategory
                                  categoryWithIdentifier:@"okay"
                                  actions:@[okayAction]
                                  intentIdentifiers:@[]
                                  options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* okayOpen = [UNNotificationCategory
                                      categoryWithIdentifier:@"okayOpen"
                                      actions:@[okayOpenAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* okayreject = [UNNotificationCategory
                                        categoryWithIdentifier:@"okayreject"
                                        actions:@[okayAction,rejectAction]
                                        intentIdentifiers:@[]
                                        options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* openlink = [UNNotificationCategory
                                      categoryWithIdentifier:@"openlink"
                                      actions:@[openAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* openlinkdeny = [UNNotificationCategory
                                          categoryWithIdentifier:@"openlinkdeny"
                                          actions:@[openAction,denyAction]
                                          intentIdentifiers:@[]
                                          options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* openlinkreject = [UNNotificationCategory
                                            categoryWithIdentifier:@"openlinkreject"
                                            actions:@[openAction,rejectAction]
                                            intentIdentifiers:@[]
                                            options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* orientation = [UNNotificationCategory
                                         categoryWithIdentifier:@"orientation"
                                         actions:@[orientationAction]
                                         intentIdentifiers:@[]
                                         options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* registerCat = [UNNotificationCategory
                                         categoryWithIdentifier:@"registerCat"
                                         actions:@[registerAction]
                                         intentIdentifiers:@[]
                                         options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* reject = [UNNotificationCategory
                                    categoryWithIdentifier:@"reject"
                                    actions:@[rejectAction]
                                    intentIdentifiers:@[]
                                    options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* respond = [UNNotificationCategory
                                     categoryWithIdentifier:@"respond"
                                     actions:@[respondAction]
                                     intentIdentifiers:@[]
                                     options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* sharenow = [UNNotificationCategory
                                      categoryWithIdentifier:@"sharenow"
                                      actions:@[sharenowAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* takemethere = [UNNotificationCategory
                                         categoryWithIdentifier:@"takemethere"
                                         actions:@[takemethereAction]
                                         intentIdentifiers:@[]
                                         options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* learnmore = [UNNotificationCategory
                                       categoryWithIdentifier:@"learnmore"
                                       actions:@[learnmoreAction]
                                       intentIdentifiers:@[]
                                       options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* takemetheredeny = [UNNotificationCategory
                                             categoryWithIdentifier:@"takemetheredeny"
                                             actions:@[takemethereAction,denyAction]
                                             intentIdentifiers:@[]
                                             options:UNNotificationCategoryOptionNone];
  
  
  UNNotificationCategory* unlikely = [UNNotificationCategory
                                      categoryWithIdentifier:@"unlikely"
                                      actions:@[unlikelyAction]
                                      intentIdentifiers:@[]
                                      options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* yes = [UNNotificationCategory
                                 categoryWithIdentifier:@"yes"
                                 actions:@[yesAction]
                                 intentIdentifiers:@[]
                                 options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* yesOpen = [UNNotificationCategory
                                     categoryWithIdentifier:@"yesOpen"
                                     actions:@[yesOpenAction]
                                     intentIdentifiers:@[]
                                     options:UNNotificationCategoryOptionNone];
  UNNotificationCategory* yesno = [UNNotificationCategory
                                   categoryWithIdentifier:@"yesno"
                                   actions:@[yesAction, noAction]
                                   intentIdentifiers:@[]
                                   options:UNNotificationCategoryOptionNone];
  
  UNNotificationCategory* openapp = [UNNotificationCategory
                                     categoryWithIdentifier:@"openapp"
                                     actions:@[openAppAction]
                                     intentIdentifiers:@[]
                                     options:UNNotificationCategoryOptionNone];
  
  UNUserNotificationCenter* center = [UNUserNotificationCenter currentNotificationCenter];
  [center setNotificationCategories:[NSSet setWithObjects:accept,acceptdeny,acceptreject,acceptignore,activate,allow,allowdont,asu101,awesome,awesomenot,call,callreject,callcoach,chat,chatcall,deny,dont,done,donenot,email,emailcall,inlineReply,wanttogo,wantnot,learnmore,likely,likelyunlikely,login,moreinfo,no,notint,notnow,okay,okayreject,okayOpen,openlink,openlinkreject,openlinkdeny,orientation,registerCat,reject,respond,sharenow,takemethere,takemetheredeny,unlikely,yes,yesOpen,yesno,openapp,nil]];
  //  [center setNotificationCategories:[NSSet setWithObjects:emailcall,callreject,nil]];
}

RCT_EXPORT_METHOD(callCompletionHandler)
{
  void (^completionHandler)() = [RNNotificationActionsManager sharedInstance].lastCompletionHandler;
  if(completionHandler != nil) {
    completionHandler();
    [RNNotificationActionsManager sharedInstance].lastCompletionHandler = nil;
  }
}

+ (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forLocalNotification:(UILocalNotification *)notification withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)())completionHandler;
{
  [self emitNotificationActionForIdentifier:identifier source:@"local" responseInfo:responseInfo userInfo:notification.userInfo completionHandler:completionHandler];
}

+ (void)application:(UIApplication *)application handleActionWithIdentifier:(NSString *)identifier forRemoteNotification:(NSDictionary *)userInfo withResponseInfo:(NSDictionary *)responseInfo completionHandler:(void (^)())completionHandler
{
  
  NSLog(@"Handing inside with identifier");
  [self emitNotificationActionForIdentifier:identifier source:@"remote" responseInfo:responseInfo userInfo:userInfo completionHandler:completionHandler];
  
  
}

+ (void)emitNotificationActionForIdentifier:(NSString *)identifier source:(NSString *)source responseInfo:(NSDictionary *)responseInfo userInfo:(NSDictionary *)userInfo completionHandler:(void (^)())completionHandler
{
  
  NSMutableDictionary *info = [[NSMutableDictionary alloc] initWithDictionary:@{
                                                                                @"identifier": identifier,
                                                                                @"source": @"local"
                                                                                }
                               ];
  // Add text if present
  
  NSString *text = [responseInfo objectForKey:UIUserNotificationActionResponseTypedTextKey];
  if (text != NULL) {
    info[@"text"] = text;
  }
  // Add userinfo if present
  if (userInfo != NULL) {
    info[@"userInfo"] = userInfo;
  }
  
  [[NSNotificationCenter defaultCenter] postNotificationName:RNNotificationActionReceived
                                                      object:self
                                                    userInfo:info];
  
  
  [RNNotificationActionsManager sharedInstance].lastActionInfo = info;
  [RNNotificationActionsManager sharedInstance].lastCompletionHandler = completionHandler;
  
}

+ (void)saveVoIPToken: (NSString *)token
{
  NSDictionary *saveToken = @{
                              @"uuid": [DeviceUID uid],
                              @"operation": @"writeToken",
                              @"appId": @"edu.asu.asumobileapp.voip",
                              @"token": token,
                              @"platform": @"ios"
                              };
  
  if ([NSJSONSerialization isValidJSONObject:saveToken]) {//validate it

    NSError* error;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:saveToken options:NSJSONWritingPrettyPrinted error: &error];
    NSURL* url = [NSURL URLWithString:@"https://dz0qr7yoti.execute-api.us-east-1.amazonaws.com/dev/tokenpref-test"];
    NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:300.0];
    [request setHTTPMethod:@"POST"];//use POST
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setValue:[NSString stringWithFormat:@"%lu",(unsigned long)[jsonData length]] forHTTPHeaderField:@"Content-length"];
    [request setHTTPBody:jsonData];//set data
    __block NSError *error1 = [[NSError alloc] init];

    //use async way to connect network
    [NSURLConnection sendAsynchronousRequest:request queue:[[NSOperationQueue alloc] init] completionHandler:^(NSURLResponse* response,NSData* data,NSError* error)
     {
       if ([data length]>0 && error == nil) {
         __block NSMutableDictionary *resultsDictionary;
         resultsDictionary = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:&error1];
         NSLog(@"resultsDictionary is %@",resultsDictionary);

       } else if ([data length]==0 && error ==nil) {
         NSLog(@" download data is null");
       } else if( error!=nil) {
         NSLog(@" error is %@",error);
       }
     }];
  }
  
}

- (void)handleSilentNotification:(NSDictionary *)info
{
  
  NSLog(@" **************** handling silent");
  
  NSString* type = [info objectForKey:@"silentType"];
  
  if( [type isEqualToString:@"deleteMsg"]) {
    
    NSString* push = [info objectForKey:@"pushId"];
    
    [UIApplication sharedApplication].applicationIconBadgeNumber = [UIApplication sharedApplication].applicationIconBadgeNumber - 1;
    [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:@[push]];
    
  } else if( [type isEqualToString:@"deviceInfo"] ) {
    
    NSLog(@" **************** devinfo");
    
    NSNumber* camera = [NSNumber numberWithBool:NO];
    NSNumber* locAlways = [NSNumber numberWithBool:NO];
    NSNumber* locWhenInUse = [NSNumber numberWithBool:NO];
    NSNumber* flashlight = [NSNumber numberWithBool:NO];
    NSString *mediaType = AVMediaTypeVideo;
    
    if ([AVCaptureDevice authorizationStatusForMediaType:mediaType] ==  AVAuthorizationStatusAuthorized) {
      camera = [NSNumber numberWithBool:YES];
      flashlight = [NSNumber numberWithBool:YES];
    }
    
    if ( [CLLocationManager locationServicesEnabled] ){
      
      if ([CLLocationManager authorizationStatus]==kCLAuthorizationStatusAuthorizedAlways){
        locAlways = [NSNumber numberWithBool:YES];
        locWhenInUse = [NSNumber numberWithBool:YES];
      } else if ([CLLocationManager authorizationStatus]==kCLAuthorizationStatusAuthorizedWhenInUse) {
        locWhenInUse = [NSNumber numberWithBool:YES];
      }
      
    }
    
    NSURL* urlToDocumentsFolder = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] lastObject];
    __autoreleasing NSError *error;
    
    NSString* pathToInfoPlist = [[NSBundle mainBundle] pathForResource:@"Info" ofType:@"plist"];
    NSString* pathToAppBundle = [pathToInfoPlist stringByDeletingLastPathComponent];
    
    NSDate *installDate = [[[NSFileManager defaultManager] attributesOfItemAtPath:urlToDocumentsFolder.path error:&error] objectForKey:NSFileCreationDate];
    NSDate *updateDate  = [[[NSFileManager defaultManager] attributesOfItemAtPath:pathToAppBundle error:&error] objectForKey:NSFileModificationDate];
    
    
    NSTimeInterval ti_install = [installDate timeIntervalSince1970];
    NSTimeInterval ti_update = [updateDate timeIntervalSince1970];
    NSTimeZone *currentTimeZone = [NSTimeZone localTimeZone];
    
    NSString *uniqueId = [DeviceUID uid];
    NSString *country = [[NSLocale currentLocale] objectForKey:NSLocaleCountryCode];
    
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString *device = [NSString stringWithCString:systemInfo.machine
                                          encoding:NSUTF8StringEncoding];
    
    UIDevice *currentDevice = [UIDevice currentDevice];
    
    NSString *appVersion = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleShortVersionString"] ?: [NSNull null];
    NSString *versionCode = [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleVersion"] ?: [NSNull null];
    
    NSDictionary *permissions = @{
                                  @"camera": camera,
                                  @"locAlways": locAlways,
                                  @"locWhenInuse": locWhenInUse,
                                  @"flashlight": flashlight
                                  };
    
    NSDictionary* dataToSend = @{
                                 @"operation": @"deviceInfo",
                                 @"uuid": uniqueId,
                                 @"country": country,
                                 @"osVersion": currentDevice.systemVersion,
                                 @"device": device,
                                 @"timeZone": currentTimeZone.name,
                                 @"installTime": [NSString stringWithFormat:@"%f", ti_install],
                                 @"lastUpdate":[NSString stringWithFormat:@"%f", ti_update],
                                 @"apiLevel": @"NA",
                                 @"appVersion": appVersion,
                                 @"versionCode": versionCode,
                                 @"permissions": permissions
                                 };

    [self executeAPICall:dataToSend givenurl:testUrl];
    
  } else if ( [type isEqualToString:@"updateLocation"] ) {
    
    if ( [CLLocationManager locationServicesEnabled] ){
      
      locationManager = [[CLLocationManager alloc] init];
      locationManager.distanceFilter = kCLDistanceFilterNone;
      locationManager.desiredAccuracy = kCLLocationAccuracyHundredMeters; // 100 m
      [locationManager startUpdatingLocation];
      
      NSString *theLocation = [NSString stringWithFormat:@"latitude: %f longitude: %f", locationManager.location.coordinate.latitude, locationManager.location.coordinate.longitude];
      NSLog(@"Location: %@",theLocation);
      
      NSDictionary* dataToSend = @{
                                   @"type": type,
                                   @"latitude": [NSString stringWithFormat:@"%f", locationManager.location.coordinate.latitude],
                                   @"longitude": [NSString stringWithFormat:@"%f", locationManager.location.coordinate.longitude]
                                   };

      [self executeAPICall:dataToSend givenurl:testUrl];
      
    }
    
  } else {
    
    NSLog(@"In default");
    
//    NSDictionary* dataToSend = @{
//                                 @"type": type
//                                 };
    
    dispatch_time_t delay = dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC * 0.75);
    dispatch_after(delay, dispatch_get_main_queue(), ^(void){
        // do work in the UI thread here
      NSLog(@"SENDING ***********");
      [self sendEventWithName:@"notificationSilentReceived" body:info];
    });
    
    
    
  }
  
}

- (void)handleTap:(NSDictionary *)info {
  
  NSString *pushPage = [info objectForKey:@"pushPage"];
  NSString *goToPage = [info objectForKey:@"goToPage"];
  NSString *extraData = [info objectForKey:@"extraData"];
  
  NSLog(@"Dismissing: Page -> %@",goToPage);
  NSLog(@"Dismissing: Data -> %@",extraData);
  NSLog(@"Dismissing: Push -> %@",pushPage);
  
  [self sendEventWithName:@"inappNotificationTapped" body:info];
  
}

- (void)handleNotificationActionReceived:(NSNotification *)notification
{
  
  //Initialize link to open
  NSString *linkToOpen = nil;
  NSString* action = [notification.userInfo objectForKey:@"identifier"];
  
  NSDictionary* ui = [notification.userInfo objectForKey:@"userInfo"];
  NSString* pId = [ui objectForKey:@"pushId"];
  NSString* title = [ui objectForKey:@"title"];
  NSString* sender = [ui objectForKey:@"sender"];
  
  NSArray* actions = [ui objectForKey:@"actions"];
  
  if( [action isEqualToString:@"Reply"] ) {
    
    NSString* message = [notification.userInfo objectForKey:@"text"];
    NSString* chatId = pId;
    
    NSDictionary* replyInfo = @{
                                @"message": message,
                                @"chatId": chatId,
                                @"title": title,
                                @"sender": sender
                                };
    
    [self sendEventWithName:@"notificationReplyReceived" body:replyInfo];
    
  } else {
    
    for( int c = 0; c < [actions count]; ++c ) {
      NSDictionary* a = actions[c];
      NSString* currAction = [a objectForKey:@"id"];
      
      if( [currAction isEqualToString:action] ) {
        
        NSString* tryGoToPage = [ui objectForKey:@"goToPage"];
        NSNumber* tryLinkToOpen = [a objectForKey:@"link"];
        
        if( tryGoToPage ) {
          [notification.userInfo setValue:tryGoToPage forKey:@"goToPage"];
        }
        
        if( [action isEqualToString:@"ShareNow"] ) {
          [notification.userInfo setValue:@"startShare" forKey:@"openShare"];
        } else if( [tryLinkToOpen boolValue] == YES ) {
          if( c == 0 ) {
            linkToOpen = [ui objectForKey:@"link"];
          } else {
            linkToOpen = [ui objectForKey:@"link2"];
          }
          [notification.userInfo setValue:linkToOpen forKey:@"linkToOpen"];
        }
        
      }
    }
      
      NSLog(@"krista hitting inside action receieved");

    //Send to react native with information, will only open to page if needs to
    [self sendEventWithName:@"notificationActionReceived" body:notification.userInfo];
    
  }
  
}

- (void) executeAPICall:(NSDictionary *) payload
               givenurl:(NSString *) givenurl {
  
  if ([NSJSONSerialization isValidJSONObject:payload]) {//validate it
    
    NSLog(@"Will send");
    
    NSError* error;
    NSData* jsonData = [NSJSONSerialization dataWithJSONObject:payload options:NSJSONWritingPrettyPrinted error: &error];
    NSURL* url = [NSURL URLWithString:givenurl];
    NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:url cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:300.0];
    [request setHTTPMethod:@"POST"];//use POST
    [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    [request setValue:[NSString stringWithFormat:@"%lu",(unsigned long)[jsonData length]] forHTTPHeaderField:@"Content-length"];
    [request setHTTPBody:jsonData];//set data
    __block NSError *error1 = [[NSError alloc] init];
    
    //use async way to connect network
    [NSURLConnection sendAsynchronousRequest:request queue:[[NSOperationQueue alloc] init] completionHandler:^(NSURLResponse* response,NSData* data,NSError* error)
     {
       if ([data length]>0 && error == nil) {
         __block NSMutableDictionary *resultsDictionary;
         resultsDictionary = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:&error1];
         NSLog(@"resultsDictionary is %@",resultsDictionary);

       } else if ([data length]==0 && error ==nil) {
         NSLog(@" download data is null");
       } else if( error!=nil) {
         NSLog(@" error is %@",error);
       }
     }];
    
  }
  
}



@end
