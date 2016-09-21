//
//  GDAppDelegate.h
//  GDCordova
//
//  Created by Good Technology on 6/11/12.
//  Copyright (c) 2013 Good Technology. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "AppDelegate.h"
#import <GD/GDios.h>

@interface GDAppDelegate : NSObject <GDiOSDelegate>
{
    BOOL started;
}

@property (nonatomic, weak) GDiOS *gdLibrary;

-(void) handleEvent:(GDAppEvent*)anEvent;
-(void) onAuthorized:(GDAppEvent*)anEvent;
-(void) onNotAuthorized:(GDAppEvent*)anEvent;

@end
