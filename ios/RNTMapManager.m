// RNTMapManager.m
#import <MapKit/MapKit.h>

#import <React/RCTViewManager.h>
#import <AmazonIVSPlayer/AmazonIVSPlayer.h>


@interface RNTMapManager : RCTViewManager
@end

@implementation RNTMapManager

RCT_EXPORT_MODULE(RNTMap)

- (UIView *)view
{
  return [[MKMapView alloc] init];
}

@end
