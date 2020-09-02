//
//  ViewController.m
//  asumobileapp
//
//  Created by Krista Coblentz on 8/5/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "ViewController.h"
#import <AmazonIVSPlayer/AmazonIVSPlayer.h>

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    NSNotificationCenter *defaultCenter = NSNotificationCenter.defaultCenter;
    [defaultCenter addObserver:self
                      selector:@selector(applicationDidEnterBackground:)
                          name:UIApplicationDidEnterBackgroundNotification
                        object:nil];
    
    [self playVideoWithURL:[[NSURL alloc] initWithString:@"https://be3fab53e0f5.us-west-2.playback.live-video.net/api/video/v1/us-west-2.456214169279.channel.u6qKzyztqeo6.m3u8"]];
}

- (void)applicationDidEnterBackground:(NSNotification *)notification {
    [_playerView.player pause];
}

// Assumes this view controller is already loaded.
// For example, this could be called by a button tap.
- (void)playVideoWithURL:(NSURL *)videoURL {
    IVSPlayer *player = [[IVSPlayer alloc] init];
    player.delegate = self;
    _playerView.player = player;
    [player load:videoURL];
}

- (void)player:(IVSPlayer *)player didChangeState:(IVSPlayerState)state {
    if (state == IVSPlayerStateReady) {
        [player play];
    }
}
- (IBAction)buttonAction:(UIButton *)sender {
    [self dismissViewControllerAnimated:TRUE completion:nil];
}

@end
