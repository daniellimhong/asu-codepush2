//
//  ShowReaction.m
//  asumobileapp
//
//  Created by Krista Coblentz on 8/8/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "ShowReaction.h"
#import <AmazonIVSPlayer/AmazonIVSPlayer.h>

@implementation ShowReaction

+ (void)displayEmoji : (NSString *)icon view:(UIView*)view playerView:(IVSPlayerView*)playerView {
  
  int baseSize = 50;

  CGRect screenRect = [[UIScreen mainScreen] bounds];
  CGFloat screenHeight = screenRect.size.height;
  CGFloat screenWidth = screenRect.size.width;
  NSInteger startHeight = screenHeight-baseSize-(screenHeight*0.10);
  
  NSInteger fontSize = [self randomNumberBetween:12 maxNumber:17];
  NSInteger max_dyCurve = [self randomNumberBetween:50 maxNumber:(startHeight/10)];
  float speed = [self randomNumberBetween:2 maxNumber:4] * 1.0;

  NSLog(@"DISPLAYING: %ld %ld",(long)startHeight/10,max_dyCurve);
  
  UIView *newView = [[UIView alloc] initWithFrame:CGRectMake(10, startHeight, baseSize, baseSize)];
  newView.backgroundColor=[UIColor clearColor];
  UITextView *mytext = [[UITextView alloc] initWithFrame:CGRectMake(0,0, baseSize, baseSize)];
  mytext.backgroundColor = [UIColor clearColor];
  mytext.editable = NO;
  mytext.font = [UIFont systemFontOfSize:fontSize];
  mytext.text = icon;
  mytext.scrollEnabled=NO;
  [newView addSubview:mytext];
  newView.layer.zPosition = 1000;
  
  [view addSubview:newView];
  
  NSInteger waveWidth = screenWidth+150;
  CGPoint point = CGPointMake(10, startHeight);
  CGPoint controlPoint = CGPointMake(point.x + waveWidth / 4.0, point.y - max_dyCurve / 4.0);
  CGPoint nextPoint = CGPointMake(point.x + waveWidth / 2.0, point.y);

  UIBezierPath *path = [UIBezierPath bezierPath];
  [path moveToPoint:point];
  [path addQuadCurveToPoint:nextPoint controlPoint:controlPoint];

  point = nextPoint;
  controlPoint = CGPointMake(point.x + waveWidth / 4.0, point.y + max_dyCurve / 4.0);
  nextPoint = CGPointMake(point.x + waveWidth / 2.0, point.y);

  [path addQuadCurveToPoint:nextPoint controlPoint:controlPoint];

  CAKeyframeAnimation *animation = [CAKeyframeAnimation animationWithKeyPath:@"position"];
  animation.fillMode = kCAFillModeForwards;
  animation.removedOnCompletion = NO;
  animation.duration = speed;
  animation.path = path.CGPath;
  [newView.layer addAnimation:animation forKey:@"myPathAnimation"];

  dispatch_time_t delay = dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC * speed);
  dispatch_after(delay, dispatch_get_main_queue(), ^(void){
    [newView removeFromSuperview];
  });
  
}

+ (NSInteger)randomNumberBetween:(NSInteger)min maxNumber:(NSInteger)max
{
  if( max < min ) max = 100;
  return min + arc4random_uniform((uint32_t)(max - min + 1));
}

@end
