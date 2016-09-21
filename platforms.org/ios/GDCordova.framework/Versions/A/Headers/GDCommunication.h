/*
 * (c) 2015 Good Technology Corporation. All rights reserved.
 */

#import <Cordova/CDV.h>
#import <GD/GDNETiOS.h>
#import "GDCBasePlugin.h"

@interface GDCHttpRequestPlugin : GDCBasePlugin <NSURLConnectionDataDelegate>

-(void)send:(CDVInvokedUrlCommand*)command;
-(void)abort:(CDVInvokedUrlCommand*)command;
-(void)clearCredentialsForMethod:(CDVInvokedUrlCommand*)command;
-(void)kerberosAllowDelegation:(CDVInvokedUrlCommand*)command;

@end
