#import <Foundation/Foundation.h>

@interface RNNotificationActionsManager : NSObject

@property (nonatomic, retain) NSDictionary *lastActionInfo;
@property (nonatomic, copy) void (^lastCompletionHandler)();

+ (nonnull instancetype)sharedInstance;

@end


