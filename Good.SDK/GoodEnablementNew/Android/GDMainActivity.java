/*
 *  This file contains Good Sample Code subject to the Good Dynamics SDK Terms and Conditions.
 *  (c) 2013 Good Technology Corporation. All rights reserved.
 */

package good;


import com.good.gd.GDAppEvent;
import com.good.gd.GDAppEventListener;
import com.good.gd.Activity;
import com.good.gd.GDAndroid;
import com.good.gd.GDAppEventType;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import {apppackage}.MainActivity;

public class GDMainActivity extends Activity implements GDAppEventListener {
    private static final String TAG = GDMainActivity.class.getSimpleName();

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // Initiate the process to Authorize the application
        GDAndroid.getInstance().authorize(this);
    }

    public void onGDEvent(GDAppEvent anEvent) {
        GDAppEventType eventType = anEvent.getEventType();

        Log.i(TAG, "DeveloperTraining::onGDEvent()::" + eventType);

        if (eventType == GDAppEventType.GDAppEventAuthorized) {
            // Launch Main Activity
            startActivity(new Intent(this, MainActivity.class));
        }
    }
}
