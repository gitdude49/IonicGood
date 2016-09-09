//
//  GDAppDelegate.m
//
//  Created by Paul Jassal on 2/13/16.
//
//

#pragma GCC diagnostic ignored "-Wdeprecated-declarations"

#import "GDAppDelegate.h"

@interface GDAppDelegate ()
@property (strong, nonatomic) UIWindow *window;
@end

@implementation GDAppDelegate


-(id)init {
    if ( self = [super init] ) {
        // Retrieve the Shared GD Instance
        GDiOS* good = [GDiOS sharedInstance];
        self.window = [good getWindow];
        
        good.delegate = self;
        
        started = false;
        
        //Show the Good Authentication UI
        [good authorize];
    }
    return self;
}


- (void)handleEvent:(GDAppEvent *)anEvent {
    
    /* Called from _good when events occur, such as system startup. */
    switch (anEvent.type)
    {
        case GDAppEventAuthorized:
        {
            [self onAuthorized:anEvent];
            break;
        }
        case GDAppEventNotAuthorized:
        {
            [self onNotAuthorized:anEvent];
            break;
        }
        case GDAppEventRemoteSettingsUpdate:
        {
            //A change to application-related configuration or policy settings.
            break;
        }
        case GDAppEventServicesUpdate:
        {
            //A change to services-related configuration.
            break;
        }
        case GDAppEventPolicyUpdate:
        {
            //A change to one or more application-specific policy settings has been received.
            break;
        }
        case GDAppEventEntitlementsUpdate:
        {
            //A change to the data plan state of the running application has been received
            break;
        }
        case GDAppEventDataPlanUpdate: {
            //depreciated
            break;
        }
    }
}

- (void)onNotAuthorized:(GDAppEvent *)anEvent {
    
    /* Handle the Good Libraries not authorized event. */
    switch (anEvent.code) {
        case GDErrorActivationFailed:
        case GDErrorProvisioningFailed:
        case GDErrorPushConnectionTimeout:
        case GDErrorSecurityError:
        case GDErrorAppDenied:
        case GDErrorAppVersionNotEntitled:
        case GDErrorBlocked:
        case GDErrorWiped:
        case GDErrorRemoteLockout:
        case GDErrorPasswordChangeRequired: {
            // an condition has occured denying authorization, an application may wish to log these events
            NSLog(@"onNotAuthorized %@", anEvent.message);
            break;
        }
        case GDErrorIdleLockout: {
            // idle lockout is benign & informational
            break;
        }
        default:
            NSAssert(false, @"Unhandled not authorized event");
            break;
    }
}

- (void)onAuthorized:(GDAppEvent *)anEvent {
    
    
    /* Handle the Good Libraries authorized event. */
    switch (anEvent.code) {
        case GDErrorNone: {
            started = true;
            AppDelegate *appDelegate = (AppDelegate *) [[UIApplication sharedApplication] delegate];
            [appDelegate launchMainApp];
            break;
        }
        default:
            NSAssert(false, @"authorized startup with an error");
            break;
    }
}

@end
