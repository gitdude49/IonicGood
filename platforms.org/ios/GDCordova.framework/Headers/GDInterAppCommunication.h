/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "GDCBasePlugin.h"
#import <GD/GDios.h>
#import <GD/GDAppDetail.h>

@interface GDInterAppCommunicationPlugin : GDCBasePlugin

-(void)getGDAppDetails:(CDVInvokedUrlCommand*)command;

@end
