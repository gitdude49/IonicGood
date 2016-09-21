/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import "GDCBasePlugin.h"
#import <GD/GDNETiOS.h>

@interface GDCSocketPlugin : GDCBasePlugin <GDSocketDelegate> 

-(void)connect:(CDVInvokedUrlCommand *)command;
-(void)send:(CDVInvokedUrlCommand *)command;
-(void)close:(CDVInvokedUrlCommand *)command;

@end
