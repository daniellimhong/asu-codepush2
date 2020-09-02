//
//  RNNotificationActionsManager.m
//  asumobileapp
//
//  Created by Krista Coblentz on 3/12/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "RNNotificationActionsManager.h"

@implementation RNNotificationActionsManager

+ (nonnull instancetype)sharedInstance {
  static RNNotificationActionsManager *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [self new];
  });
  return sharedInstance;
}

@end


