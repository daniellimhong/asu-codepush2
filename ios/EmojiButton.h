//
//  EmojiButton.h
//  asumobileapp
//
//  Created by Krista Coblentz on 8/6/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef EmojiButton_h
#define EmojiButton_h

@class IVSPlayerView;
@interface EmojiButton : NSObject

+ (UIButton*)custombutton : (UIButton *)btn title:(NSString*)emojiIcon view:(IVSPlayerView*)_playerView emojInd:(NSInteger)eInx;

@end

#endif /* EmojiButton_h */
