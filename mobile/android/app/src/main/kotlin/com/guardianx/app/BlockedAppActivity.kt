package com.guardianx.app

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

class BlockedAppActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make activity full-screen / immersive
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        )

        val packageName = intent.getStringExtra("package_name") ?: "Application"
        val appName = intent.getStringExtra("app_name") ?: packageName

        val rootScrollView = ScrollView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0B132B")) // GuardianX primary dark navy
            isFillViewport = true
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(dp(28), dp(48), dp(28), dp(36))
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // 1. Icon Container with Warning Badge
        val iconContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            val size = dp(96)
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                bottomMargin = dp(24)
            }
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(Color.parseColor("#3B1824")) // Subtle dark red background
                setStroke(dp(3), Color.parseColor("#EF4444")) // Crimson border
            }
        }

        val iconView = ImageView(this).apply {
            val iconSize = dp(48)
            layoutParams = LinearLayout.LayoutParams(iconSize, iconSize)
            setImageResource(android.R.drawable.ic_lock_lock)
            setColorFilter(Color.parseColor("#EF4444"))
        }
        iconContainer.addView(iconView)
        container.addView(iconContainer)

        // 2. Main Title
        val titleView = TextView(this).apply {
            text = "ACCESS RESTRICTED"
            setTextColor(Color.parseColor("#EF4444"))
            textSize = 20f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            letterSpacing = 0.08f
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dp(8)
            }
        }
        container.addView(titleView)

        // 3. Blocked App Subtitle
        val appNameView = TextView(this).apply {
            text = "$appName is Blocked"
            setTextColor(Color.WHITE)
            textSize = 24f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dp(16)
            }
        }
        container.addView(appNameView)

        // 4. Explanation Card
        val cardLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(18), dp(20), dp(18))
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(16).toFloat()
                setColor(Color.parseColor("#1C2541")) // GuardianX card dark navy
                setStroke(dp(1), Color.parseColor("#2A3756"))
            }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dp(32)
            }
        }

        val explanationView = TextView(this).apply {
            text = "Your parent has temporarily restricted access to this app on GuardianX to help you maintain healthy digital habits, balance your screen time, and stay focused on your daily routines and prayer."
            setTextColor(Color.parseColor("#CBD5E1")) // Slate 300
            textSize = 14f
            gravity = Gravity.CENTER
            setLineSpacing(dp(4).toFloat(), 1.0f)
        }
        cardLayout.addView(explanationView)
        container.addView(cardLayout)

        // 5. "Return to Home" Primary Button
        val homeButton = Button(this).apply {
            text = "Return to Home Screen"
            setTextColor(Color.WHITE)
            textSize = 15f
            typeface = Typeface.DEFAULT_BOLD
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(12).toFloat()
                setColor(Color.parseColor("#3B82F6")) // Blue
            }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(52)
            ).apply {
                bottomMargin = dp(12)
            }
            setOnClickListener {
                goHome()
            }
        }
        container.addView(homeButton)

        // 6. "Open GuardianX" Secondary Button
        val openAppButton = Button(this).apply {
            text = "Open GuardianX Safety Center"
            setTextColor(Color.parseColor("#94A3B8"))
            textSize = 13f
            typeface = Typeface.DEFAULT
            background = GradientDrawable().apply {
                shape = GradientDrawable.RECTANGLE
                cornerRadius = dp(12).toFloat()
                setColor(Color.parseColor("#151E34"))
                setStroke(dp(1), Color.parseColor("#2A3756"))
            }
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dp(48)
            )
            setOnClickListener {
                openGuardianX()
            }
        }
        container.addView(openAppButton)

        rootScrollView.addView(container)
        setContentView(rootScrollView)
    }

    override fun onBackPressed() {
        // Prevent pressing back to slip back into the blocked app
        goHome()
    }

    private fun goHome() {
        try {
            val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(homeIntent)
        } catch (_: Exception) {}
        finish()
    }

    private fun openGuardianX() {
        try {
            val mainIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(mainIntent)
        } catch (_: Exception) {}
        finish()
    }

    private fun dp(value: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            value.toFloat(),
            resources.displayMetrics
        ).toInt()
    }
}
