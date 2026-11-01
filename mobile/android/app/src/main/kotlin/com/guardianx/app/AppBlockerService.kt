package com.guardianx.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log

class AppBlockerService : Service() {

    private val handler = Handler(Looper.getMainLooper())
    private var isMonitoring = false
    private var lastBlockedPkg: String? = null
    private var lastBlockTriggerTime: Long = 0

    private val monitorRunnable = object : Runnable {
        override fun run() {
            try {
                checkForegroundApp()
            } catch (e: Exception) {
                Log.e(TAG, "Error checking foreground app: ${e.message}")
            } finally {
                if (isMonitoring) {
                    handler.postDelayed(this, CHECK_INTERVAL_MS)
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        BlockerManager.initialize(applicationContext)
        createNotificationChannel()
        val notification = buildForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)
        startMonitoring()
        Log.d(TAG, "AppBlockerService created and monitoring started.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        BlockerManager.initialize(applicationContext)
        if (!isMonitoring) {
            startMonitoring()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        stopMonitoring()
        super.onDestroy()
        Log.d(TAG, "AppBlockerService destroyed.")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startMonitoring() {
        isMonitoring = true
        handler.removeCallbacks(monitorRunnable)
        handler.post(monitorRunnable)
    }

    private fun stopMonitoring() {
        isMonitoring = false
        handler.removeCallbacks(monitorRunnable)
    }

    private fun checkForegroundApp() {
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return
        val now = System.currentTimeMillis()
        val events = usm.queryEvents(now - 3000, now) ?: return

        var topPackage: String? = null
        val event = UsageEvents.Event()
        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            // ACTIVITY_RESUMED indicates application brought to the foreground
            if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED) {
                topPackage = event.packageName
            }
        }

        if (topPackage != null && BlockerManager.isBlocked(applicationContext, topPackage)) {
            // Debounce within 1000ms for identical package to avoid intent spamming
            if (topPackage != lastBlockedPkg || (now - lastBlockTriggerTime) > 1000) {
                lastBlockedPkg = topPackage
                lastBlockTriggerTime = now
                Log.w(TAG, "Blocked app detected in foreground: $topPackage")
                BlockerManager.blockCurrentApp(applicationContext, topPackage)
            }
        } else if (topPackage != null && topPackage != "com.guardianx.app") {
            lastBlockedPkg = null
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "GuardianX Child Protection",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors app limits and ensures digital wellbeing protection"
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm?.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("GuardianX Protection Active")
            .setContentText("Child digital wellbeing and app limits active")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val TAG = "AppBlockerService"
        private const val CHANNEL_ID = "guardianx_blocker_channel"
        private const val NOTIFICATION_ID = 4001
        private const val CHECK_INTERVAL_MS = 500L

        fun startService(context: Context) {
            val intent = Intent(context, AppBlockerService::class.java)
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start AppBlockerService: ${e.message}")
            }
        }

        fun stopService(context: Context) {
            try {
                val intent = Intent(context, AppBlockerService::class.java)
                context.stopService(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to stop AppBlockerService: ${e.message}")
            }
        }
    }
}

