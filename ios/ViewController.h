//
//  ViewController.h
//  asumobileapp
//
//  Created by Krista Coblentz on 8/5/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <UIKit/UIKit.h>

@class IVSPlayerView;

NS_ASSUME_NONNULL_BEGIN

@interface ViewController : UIViewController
@property (weak, nonatomic) IBOutlet UIButton *goBackBtn;
@property (weak, nonatomic) IBOutlet IVSPlayerView *playerView;

@end

NS_ASSUME_NONNULL_END
