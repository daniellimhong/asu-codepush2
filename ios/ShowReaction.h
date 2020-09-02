//
//  ShowReaction.h
//  asumobileapp
//
//  Created by Krista Coblentz on 8/8/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef ShowReaction_h
#define ShowReaction_h

@class IVSPlayerView;
@interface ShowReaction : NSObject

+ (void)displayEmoji : (NSString *)icon view:(UIView*)view playerView:(IVSPlayerView*)playerView;

@end

#endif /* ShowReaction_h */
