/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Foundation/Foundation.h>
#import <Cordova/CDV.h>
#import <Cordova/NSArray+Comparisons.h>
#import <GD/GDFileSystem.h>

@interface GDCFileTransferPlugin : CDVPlugin

- (void) upload:(CDVInvokedUrlCommand *)command;
- (void) download:(CDVInvokedUrlCommand *)command;

@end


