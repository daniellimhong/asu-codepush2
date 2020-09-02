//
//  ViewManager.m
//  asumobileapp
//
//  Created by Krista Coblentz on 8/5/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "MyViewManager.h"
#import "NewViewAllInOne.h"
#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>
#import <AmazonIVSPlayer/AmazonIVSPlayer.h>

@implementation MyViewManager

RCT_EXPORT_MODULE(MyViewMan);
RCT_EXPORT_VIEW_PROPERTY(streamUrl, NSString);
RCT_EXPORT_VIEW_PROPERTY(shouldPlay, NSString);
RCT_EXPORT_VIEW_PROPERTY(emojis, NSString);

NewViewAllInOne * theView;

- (UIView *)view
{
  theView = [[[NSBundle mainBundle] loadNibNamed:@"CustomViewView" owner:self options:nil] objectAtIndex:0];
  theView.translatesAutoresizingMaskIntoConstraints = YES;
  return theView;
}

@end
