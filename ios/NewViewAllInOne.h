//
//  NewViewAllInOne.h
//  asumobileapp
//
//  Created by Krista Coblentz on 8/6/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef NewViewAllInOne_h
#define NewViewAllInOne_h

#import <UIKit/UIKit.h>
@class IVSPlayerView;

@interface NewViewAllInOne : UIView

@property (nonatomic) NSString* streamUrl;
@property (nonatomic) NSString* shouldPlay;
@property (nonatomic) NSString *emojis;
@property (nonatomic) NSArray* buttons;
@property (nonatomic) NSInteger MAX_VIEWS;
@property (nonatomic) Boolean canClick;
@property (nonatomic) NSTimeInterval lastClickTime;
@property (nonatomic) NSMutableArray* currentButtons;
@property (nonatomic) NSMutableArray* sentIds;
@property (nonatomic) CAGradientLayer* gradientLayer;
@property (nonatomic) CGSize lastKnownSize;
@property (weak, nonatomic) IBOutlet IVSPlayerView *playerView;
@property (weak, nonatomic) IBOutlet UIView *gradientViewHolder;

@end


#endif /* NewViewAllInOne_h */
