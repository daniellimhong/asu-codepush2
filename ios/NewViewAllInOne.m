//
//  NewViewAllInOne.m
//  asumobileapp
//
//  Created by Krista Coblentz on 8/6/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "NewViewAllInOne.h"
#import "EmojiButton.h"
#import "ShowReaction.h"
#import <AmazonIVSPlayer/AmazonIVSPlayer.h>
#import <AVFoundation/AVFoundation.h>

@implementation NewViewAllInOne
{
  NSString *currentStream;
  NSString *shouldPlay;
  NSString *emojis;
}

- (void)awakeFromNib {
  
  [super awakeFromNib];
  [self renderScreen];
  _playerView.layer.zPosition = 10;
  NSNotificationCenter *defaultCenter = NSNotificationCenter.defaultCenter;
  [defaultCenter addObserver:self
                    selector:@selector(applicationDidEnterBackground:)
                        name:UIApplicationDidEnterBackgroundNotification
                      object:nil];
  [defaultCenter addObserver:self
                    selector:@selector(applicationDidBecomeActive:)
                        name:UIApplicationDidBecomeActiveNotification
                      object:nil];
  NSError *error = nil;
  _canClick = true;
  _MAX_VIEWS = 75;
  BOOL success = [[AVAudioSession sharedInstance]
                  setCategory:AVAudioSessionCategoryPlayback
                  error:&error];
  _lastClickTime = ([[NSDate date] timeIntervalSince1970] * 1000);
}

- (void)layoutSubviews {
  
  [super layoutSubviews];
  
  CGRect screenRect = [[UIScreen mainScreen] bounds];
  CGFloat screenWidth = screenRect.size.width;
  CGFloat screenHeight = screenRect.size.height;
  
  if( _lastKnownSize.width != screenWidth && _lastKnownSize.height != screenHeight ) {
    [self clearButtons];
    [self renderScreen];
  }
  
}

-(void) clearButtons {
  for (UIView* subV in self.subviews) {
      if ([subV isKindOfClass:[UIButton class]])
          [subV removeFromSuperview];
  }
  _currentButtons = [[NSMutableArray alloc] init];
}

-(void) renderScreen {
  CGRect screenRect = [[UIScreen mainScreen] bounds];
  CGFloat screenWidth = screenRect.size.width;
  CGFloat screenHeight = screenRect.size.height;
  
  _lastKnownSize = CGSizeMake(screenWidth,screenHeight);

  _gradientViewHolder.translatesAutoresizingMaskIntoConstraints = YES;
  _gradientViewHolder.frame =CGRectMake(0,0,screenWidth,screenHeight);
  
  dispatch_time_t delay = dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC * 0.5);
  dispatch_after(delay, dispatch_get_main_queue(), ^(void){
    self.frame = CGRectMake(0,0,screenWidth,screenHeight);
    [self getEmojis];
  });
  
  _playerView.translatesAutoresizingMaskIntoConstraints = YES;
  
  if( screenWidth > screenHeight ) {
    _playerView.frame = CGRectMake(0, 0,screenWidth,screenHeight);
    _playerView.center = CGPointMake(screenWidth/2,screenHeight/2);
    _playerView.layer.cornerRadius = 0;
  } else {
    _playerView.frame = CGRectMake(0, 30,screenWidth*0.9,screenHeight*0.3);
    _playerView.center = CGPointMake(screenWidth/2,_playerView.center.y);
    _playerView.layer.cornerRadius = 10;
  }
  [self applyGradient];
}

-(void) applyGradient {

  if( !_gradientLayer ) _gradientLayer = [CAGradientLayer layer];
  
  _gradientLayer.frame = _gradientViewHolder.bounds;
  _gradientLayer.startPoint = CGPointMake(0, 0);
  _gradientLayer.endPoint = CGPointMake(0, 1);

  UIColor *customMaroon = [UIColor colorWithRed:32/255.0 green:34/255.0 blue:56/255.0 alpha:1.0];
  UIColor *customGold = [UIColor colorWithRed:182/255.0 green:185/255.0 blue:219/255.0 alpha:1.0];
  _gradientLayer.colors = [NSArray arrayWithObjects:(id)[customMaroon CGColor],(id)[customMaroon CGColor],(id)[customMaroon CGColor],(id)[customMaroon CGColor],(id)[customGold CGColor], nil];
  
  [_gradientViewHolder.layer insertSublayer:_gradientLayer atIndex:0];
}

- (void)applicationDidEnterBackground:(NSNotification *)notification {
  NSLog(@"DID GO TO BACKGROUND");
    [_playerView.player pause];
}

- (void)applicationDidBecomeActive:(NSNotification *)notification {
  NSLog(@"DID GO TO FOREGROUND: %ld",(long)_playerView.player.state);
    if( _playerView.player.state == IVSPlayerStateIdle )
      [_playerView.player play];
}

- (void)setStreamUrl:(NSString*)streamUrl
{
    currentStream = streamUrl;
    [self playVideoWithURL:[[NSURL alloc] initWithString:currentStream]];
    [self setNeedsDisplay];
}

- (void)setShouldPlay:(NSString*)sp
{
  shouldPlay = sp;
  if( [shouldPlay isEqualToString:@"destroy"] ) {
    [_playerView.player pause];
  }
}

-(void) setEmojis:(NSString*)e {
  NSData* data = [e dataUsingEncoding:NSUTF8StringEncoding];
  NSArray* jsonArr = [NSJSONSerialization JSONObjectWithData:data
  options:NSJSONReadingMutableContainers
    error:nil];
  _buttons = jsonArr;
  dispatch_async(dispatch_get_main_queue(), ^{
    [self addAllButtons:jsonArr];
  });
}

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

- (void)player:(IVSPlayer *)player didOutputCue:(IVSCue*)cue {
  
  IVSTextMetadataCue *textMetadataCue = (IVSTextMetadataCue*)cue;
  id sentInfo = [NSJSONSerialization JSONObjectWithData:[textMetadataCue.text dataUsingEncoding:NSUTF8StringEncoding]
  options:0 error:NULL];
  NSString* procId = [sentInfo objectForKey:@"processedId"];
  NSString* type = [sentInfo objectForKey:@"type"];
  if( ![_sentIds containsObject:procId] ) {
    for (id object in _buttons) {
      NSString* iconName = [object objectForKey:@"name"];
      NSString* icon = [object objectForKey:@"icon"];
      if( [iconName isEqualToString:type] ) {
        [self displayEmoji:icon];
      }
    }
  }
  
}

-(void) addEmojiButton: (NSString*) emojiName emojiIcon:(NSString *) emojiIcon eInx: (NSInteger) eInx {

  UIButton* button = [UIButton buttonWithType:UIButtonTypeCustom];
  button = [EmojiButton custombutton:button title:emojiIcon view:_playerView emojInd:eInx];
  [button addTarget:self
             action:@selector(sendReaction:)
   forControlEvents:UIControlEventTouchUpInside];
  
  if( !_currentButtons ) _currentButtons = [[NSMutableArray alloc] init];
  [_currentButtons addObject:button];
  
  [self addSubview:button];
  
}

-(void) displayEmoji: (NSString*) emoji {
  NSInteger count= [[self subviews] count];
  if( count < _MAX_VIEWS ) {
    [ShowReaction displayEmoji:emoji view:self playerView:_playerView];
  }
}

- (void)sendReaction:(UIButton*)sender {
  
  id showEmojiInfo = _buttons[sender.tag];
  NSString* icon = [showEmojiInfo objectForKey:@"icon"];
  NSString* name = [showEmojiInfo objectForKey:@"name"];
  NSString* reqId = [self getUUid];
  if (!_sentIds) _sentIds = [[NSMutableArray alloc] init];
  [_sentIds addObject:reqId];
  
  NSString* url = [NSString stringWithFormat:@"https://a7n0975z9k.execute-api.us-west-2.amazonaws.com/dev/emoji?type=%@&id=%@",name,reqId];
  
  NSTimeInterval curr = ([[NSDate date] timeIntervalSince1970] * 1000);

  if( _canClick && curr-_lastClickTime > 1000 ) {
    _lastClickTime = curr;
    [self newApiCall:url buttonSet:false];
    [self displayEmoji:icon];
  }
  
}

-(NSString* ) getUUid {
  CFUUIDRef uuidRef = CFUUIDCreate(NULL);
  CFStringRef uuidStringRef = CFUUIDCreateString(NULL, uuidRef);
  CFRelease(uuidRef);
  return (__bridge NSString *)uuidStringRef;
}

-(void) getEmojis {
  if( !_buttons ) {
//    [self newApiCall:@"https://a7n0975z9k.execute-api.us-west-2.amazonaws.com/dev/emoji?type=getEmojis" buttonSet:true];
  } else {
    [self addAllButtons:_buttons];
  }
}
     
-(void) addAllButtons:(NSArray*) arr {
  NSInteger counter = 0;
  for (id object in arr) {
    NSString* icon = [object objectForKey:@"icon"];
    NSString* name = [object objectForKey:@"name"];
    [self addEmojiButton:name emojiIcon:icon eInx:counter ];
    ++counter;
  }
}

-(void) newApiCall: (NSString*) givenurl buttonSet:(BOOL) buttonSet {
  _canClick = false;
  NSMutableURLRequest *urlRequest = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:givenurl]];

  [urlRequest setHTTPMethod:@"GET"];

  NSURLSession *session = [NSURLSession sharedSession];

  NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:urlRequest completionHandler:^(NSData *data, NSURLResponse *response, NSError *error)
  {
    NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse *)response;
    _canClick = true;
    if(httpResponse.statusCode == 200) {
      if( buttonSet ) {
        NSArray* jsonArr = [NSJSONSerialization JSONObjectWithData:data
        options:kNilOptions
          error:&error];
        _buttons = jsonArr;
        dispatch_async(dispatch_get_main_queue(), ^{
          [self addAllButtons:jsonArr];
        });
      }
      
    }
  }];
  [dataTask resume];
}

@end
