/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "GDCBasePlugin.h"
#import <GD/GDUtility.h>
#import <GD/GDiOS.h>

@interface GDSpecificPoliciesPlugin : GDCBasePlugin

- (void) updatePolicy:(CDVInvokedUrlCommand *)command;

@end