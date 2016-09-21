/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <objc/runtime.h>
#import <Cordova/CDV.h>
#import "GDCBasePlugin.h"
#import <GD/GDAppDetail.h>
#import <GD/GDAppServer.h>

@interface GDServerSideServicesPlugin : GDCBasePlugin

- (void)callGDServerSideService:(CDVInvokedUrlCommand *)command;

@end