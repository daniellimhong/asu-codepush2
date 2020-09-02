//
//  EmojiButton.m
//  asumobileapp
//
//  Created by Krista Coblentz on 8/6/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "EmojiButton.h"
#import <AmazonIVSPlayer/AmazonIVSPlayer.h>

@implementation EmojiButton

+(UIButton*)custombutton : (UIButton *)btn title:(NSString*)emojiIcon view:(IVSPlayerView*)_playerView emojInd:(NSInteger)eInx
{
  [btn sendActionsForControlEvents:UIControlEventTouchUpInside];
  btn.layer.masksToBounds = YES;
  btn.titleLabel.font = [UIFont systemFontOfSize:15.0 weight:UIFontWeightRegular];
  btn.layer.cornerRadius = 5;
  btn.backgroundColor = [UIColor colorWithWhite:1 alpha:0.5];

  [btn setTitle:emojiIcon forState:UIControlStateNormal];
  CGSize baseSize = _playerView.frame.size;
  CGPoint basePt = _playerView.frame.origin;

  CGRect screenRect = [[UIScreen mainScreen] bounds];
  CGFloat screenHeight = screenRect.size.height;
  CGFloat screenWidth = screenRect.size.width;
  
  float startX = basePt.x+5;
  float startY = basePt.y + baseSize.height + 10;
  int width = 40;
  
  if( screenWidth > screenHeight ) {
    startY = screenHeight - 50;
  }

  btn.frame = CGRectMake((eInx*(width+10))+startX, startY, width, 30.0);
  btn.tag = eInx;


  return btn;
}

@end
