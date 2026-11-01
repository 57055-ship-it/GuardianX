package com.guardianx.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            Log.d("BootReceiver", "Device boot completed, checking blocked packages...")
            BlockerManager.initialize(context)
            val blocked = BlockerManager.getBlockedPackages(context)
            if (blocked.isNotEmpty()) {
                Log.d("BootReceiver", "Starting AppBlockerService with ${blocked.size} blocked packages")
                AppBlockerService.startService(context)
            }
        }
    }
}

