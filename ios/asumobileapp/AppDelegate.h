/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <PushKit/PushKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, PKPushRegistryDelegate> {
  NSDictionary *options;
  UIViewController *viewController;
}

@property (nonatomic, strong) UIWindow *window;
@property (nonatomic, strong) UIView* notifView;
@property (nonatomic, strong) UIView* notifViewHolder;
@property (nonatomic, strong) NSDictionary* currUserInfo;
@property (nonatomic, strong) PKPushRegistry* pushRegistry;

- (void) setInitialViewController;
- (void) goToRegisterView;
- (void) goToNativeView;

@end
