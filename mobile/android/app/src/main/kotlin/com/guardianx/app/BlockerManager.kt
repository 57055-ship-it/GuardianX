package com.guardianx.app

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log

object BlockerManager {
    private const val TAG = "BlockerManager"
    private const val PREFS_NAME = "guardianx_blocker_prefs"
    private const val KEY_BLOCKED_PACKAGES = "blocked_packages"

    private val blockedPackages = mutableSetOf<String>()
    private var isInitialized = false

    // System packages and critical apps that must never be blocked
    private val SYSTEM_WHITELIST = setOf(
        "com.guardianx.app",
        "com.example.guardianx",
        "com.android.systemui",
        "com.android.launcher",
        "com.sec.android.app.launcher",
        "com.google.android.apps.nexuslauncher",
        "com.android.dialer",
        "com.google.android.dialer",
        "com.samsung.android.dialer",
        "com.android.server.telecom"
    )

    fun initialize(context: Context) {
        if (isInitialized) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val saved = prefs.getStringSet(KEY_BLOCKED_PACKAGES, emptySet()) ?: emptySet()
        synchronized(blockedPackages) {
            blockedPackages.clear()
            blockedPackages.addAll(saved)
        }
        isInitialized = true
        Log.d(TAG, "Initialized with ${blockedPackages.size} blocked packages: $blockedPackages")
    }

    fun setBlockedPackages(context: Context, packages: Collection<String>) {
        synchronized(blockedPackages) {
            blockedPackages.clear()
            blockedPackages.addAll(packages.map { it.trim() }.filter { it.isNotEmpty() && !SYSTEM_WHITELIST.contains(it) })
        }
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putStringSet(KEY_BLOCKED_PACKAGES, blockedPackages).apply()
        Log.d(TAG, "Updated blocked packages: $blockedPackages")

        // Start or stop AppBlockerService based on whether any app is blocked
        if (blockedPackages.isNotEmpty()) {
            AppBlockerService.startService(context)
        }
    }

    fun getBlockedPackages(context: Context): Set<String> {
        initialize(context)
        synchronized(blockedPackages) {
            return HashSet(blockedPackages)
        }
    }

    fun isBlocked(context: Context, packageName: String?): Boolean {
        if (packageName.isNullOrBlank()) return false
        if (SYSTEM_WHITELIST.contains(packageName)) return false
        initialize(context)
        synchronized(blockedPackages) {
            return blockedPackages.contains(packageName)
        }
    }

    fun getAppLabel(context: Context, packageName: String): String {
        return try {
            val pm = context.packageManager
            val info = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getApplicationInfo(packageName, PackageManager.ApplicationInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getApplicationInfo(packageName, 0)
            }
            pm.getApplicationLabel(info).toString()
        } catch (e: Exception) {
            packageName.substringAfterLast('.')
        }
    }

    fun blockCurrentApp(context: Context, packageName: String) {
        val appName = getAppLabel(context, packageName)
        Log.w(TAG, "INTERCEPTING BLOCKED APP: $packageName ($appName)")

        // 1. Kick out of blocked application to Home screen immediately
        try {
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            context.startActivity(homeIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch home intent: ${e.message}")
        }

        // 2. Launch BlockedAppActivity over the screen
        try {
            val blockIntent = Intent(context, BlockedAppActivity::class.java).apply {
                putExtra("package_name", packageName)
                putExtra("app_name", appName)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            context.startActivity(blockIntent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch BlockedAppActivity: ${e.message}")
        }
    }
}
