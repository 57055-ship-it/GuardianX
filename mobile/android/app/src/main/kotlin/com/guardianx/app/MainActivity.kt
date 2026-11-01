package com.guardianx.app

import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import java.io.ByteArrayOutputStream

class MainActivity : FlutterFragmentActivity() {
    private val USAGE_CHANNEL = "com.guardianx/usage_stats"
    private val BLOCKER_CHANNEL = "com.guardianx/app_blocker"

    override fun onCreate(savedInstanceState: android.os.Bundle?) {
        super.onCreate(savedInstanceState)
        BlockerManager.initialize(applicationContext)
        val blocked = BlockerManager.getBlockedPackages(applicationContext)
        if (blocked.isNotEmpty()) {
            AppBlockerService.startService(applicationContext)
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, USAGE_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "hasUsagePermission" -> {
                    result.success(checkUsageStatsPermission())
                }
                "openUsageSettings" -> {
                    result.success(openUsageAccessSettings())
                }
                "openAppDetails" -> {
                    result.success(openAppDetailsSettings())
                }
                "getAppLabel" -> {
                    val pkg = call.argument<String>("packageName")
                    if (pkg != null) {
                        result.success(getAppLabel(pkg))
                    } else {
                        result.error("INVALID_ARGUMENT", "packageName is required", null)
                    }
                }
                "getAppIcon" -> {
                    val pkg = call.argument<String>("packageName")
                    if (pkg != null) {
                        result.success(getAppIcon(pkg))
                    } else {
                        result.error("INVALID_ARGUMENT", "packageName is required", null)
                    }
                }
                else -> {
                    result.notImplemented()
                }
            }
        }

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, BLOCKER_CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "requestPermissions" -> {
                    result.success(openUsageAccessSettings())
                }
                "isAppBlockingEnabled" -> {
                    result.success(checkUsageStatsPermission())
                }
                "setBlockedApps" -> {
                    val rawPkgs = call.argument<List<String>>("packages")
                        ?: if (call.arguments is List<*>) {
                            @Suppress("UNCHECKED_CAST")
                            call.arguments as List<String>
                        } else null

                    if (rawPkgs != null) {
                        BlockerManager.setBlockedPackages(applicationContext, rawPkgs)
                        result.success(true)
                    } else {
                        result.error("INVALID_ARGUMENT", "packages list required", null)
                    }
                }
                "getBlockedApps" -> {
                    val blocked = BlockerManager.getBlockedPackages(applicationContext)
                    result.success(ArrayList(blocked))
                }
                "hasOverlayPermission" -> {
                    val hasOverlay = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        Settings.canDrawOverlays(this)
                    } else {
                        true
                    }
                    result.success(hasOverlay)
                }
                "requestOverlayPermission" -> {
                    result.success(openOverlaySettings())
                }
                "enablePrayerLock" -> {
                    result.success(true)
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    private fun checkUsageStatsPermission(): Boolean {
        return try {
            val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    packageName
                )
            }
            mode == AppOpsManager.MODE_ALLOWED
        } catch (e: Exception) {
            false
        }
    }

    private fun openUsageAccessSettings(): Boolean {
        return try {
            // ACTION_USAGE_ACCESS_SETTINGS opens the system screen titled 'Usage Access' / 'Apps with usage access'
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            true
        } catch (e: Exception) {
            try {
                val fallback = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(fallback)
                true
            } catch (e2: Exception) {
                false
            }
        }
    }

    private fun openAppDetailsSettings(): Boolean {
        return try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    private fun openOverlaySettings(): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                ).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(intent)
                true
            } else {
                true
            }
        } catch (e: Exception) {
            try {
                val fallback = Intent(Settings.ACTION_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(fallback)
                true
            } catch (e2: Exception) {
                false
            }
        }
    }

    private fun getAppLabel(pkgName: String): String? {
        return try {
            val pm = packageManager
            val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.getApplicationInfo(pkgName, PackageManager.ApplicationInfoFlags.of(0))
            } else {
                @Suppress("DEPRECATION")
                pm.getApplicationInfo(pkgName, 0)
            }
            pm.getApplicationLabel(appInfo).toString()
        } catch (e: Exception) {
            null
        }
    }

    private fun getAppIcon(pkgName: String): ByteArray? {
        return try {
            val pm = packageManager
            val drawable = pm.getApplicationIcon(pkgName)
            val bitmap = when (drawable) {
                is BitmapDrawable -> drawable.bitmap
                else -> {
                    val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
                    val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
                    val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                    val canvas = Canvas(bmp)
                    drawable.setBounds(0, 0, canvas.width, canvas.height)
                    drawable.draw(canvas)
                    bmp
                }
            }
            val stream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
            stream.toByteArray()
        } catch (e: Exception) {
            null
        }
    }
}
