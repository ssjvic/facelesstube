package com.example.facelesstube

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private val screenHistory = mutableListOf<String>()

    // Map of tab IDs to their corresponding Stitch screen folders
    private val tabScreens = mapOf(
        "home" to "facelesstube_user_dashboard_1",
        "create" to "quick_create__all-in-one_1",
        "billing" to "billing_history_&_invoices",
        "profile" to "facelesstube_access_1"
    )

    // All available screen paths for navigation
    private val screenPaths = mapOf(
        "dashboard" to "facelesstube_user_dashboard_1",
        "dashboard2" to "facelesstube_user_dashboard_2",
        "create" to "quick_create__all-in-one_1",
        "create2" to "quick_create__all-in-one_2",
        "step1" to "create_video__step_1_script",
        "step2" to "create_video__step_2_media",
        "step3" to "create_video__step_3_review",
        "billing" to "billing_history_&_invoices",
        "access1" to "facelesstube_access_1",
        "access2" to "facelesstube_access_2",
        "landing1" to "facelesstube_landing_&_promos_1",
        "landing2" to "facelesstube_landing_&_promos_2",
        "learning" to "learning_center_&_tutorials",
        "videos" to "my_videos_&_rendering_status",
        "register" to "registration_success_&_offer",
        "subscription" to "subscription_success_celebration",
        "welcome_success" to "success_&_welcome_message",
        "support" to "support_&_contact_us",
        "welcome" to "welcome_to_facelesstube",
        "api" to "api_integrations_&_setup"
    )

    private var currentTab = "home"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Edge-to-edge + dark status bar
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.parseColor("#121212")
        window.navigationBarColor = Color.parseColor("#121212")

        // Root layout
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.parseColor("#121212"))
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
        }

        // WebView
        webView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
            setBackgroundColor(Color.parseColor("#121212"))
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.loadWithOverviewMode = true
            settings.useWideViewPort = true
            settings.setSupportZoom(false)
            settings.builtInZoomControls = false
            settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url?.toString() ?: return false
                    // Handle external links
                    if (url.startsWith("http://") || url.startsWith("https://")) {
                        return false // Let WebView handle CDN resources
                    }
                    return false
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    // Inject navigation JavaScript bridge
                    injectNavigationBridge()
                }
            }

            webChromeClient = WebChromeClient()
        }

        rootLayout.addView(webView)

        // Bottom Navigation Bar
        val bottomNav = createBottomNavBar()
        rootLayout.addView(bottomNav)

        setContentView(rootLayout)

        // Load initial screen (dashboard)
        loadScreen("facelesstube_user_dashboard_1")
    }

    private fun loadScreen(screenFolder: String) {
        val url = "file:///android_asset/stitch/$screenFolder/code.html"
        screenHistory.add(screenFolder)
        webView.loadUrl(url)
    }

    private fun injectNavigationBridge() {
        // Inject JS to handle clicks on navigation items and
        // intercept bottom nav bar clicks inside HTML pages
        val js = """
            (function() {
                // Make buttons inside bottom nav clickable via Android bridge
                var navButtons = document.querySelectorAll('nav button, footer button');
                navButtons.forEach(function(btn) {
                    var text = btn.textContent.trim().toLowerCase();
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        if (text.includes('home')) {
                            window.location = 'facelesstube://navigate/home';
                        } else if (text.includes('create') || text.includes('movie')) {
                            window.location = 'facelesstube://navigate/create';
                        } else if (text.includes('billing') || text.includes('receipt')) {
                            window.location = 'facelesstube://navigate/billing';
                        } else if (text.includes('profile') || text.includes('person')) {
                            window.location = 'facelesstube://navigate/profile';
                        }
                    });
                });

                // Handle navigation arrow clicks
                var backBtns = document.querySelectorAll('[data-icon="ArrowLeft"], [class*="arrow_back"]');
                backBtns.forEach(function(btn) {
                    btn.closest('div, button')?.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.history.back();
                    });
                });

                // Hide the original bottom nav from HTML (we use native one)
                var htmlNav = document.querySelector('nav:last-of-type');
                if (htmlNav && htmlNav.classList.contains('fixed')) {
                    htmlNav.style.display = 'none';
                }
                // Also hide footer nav if present
                var footer = document.querySelector('footer.fixed');
                if (footer) {
                    footer.style.display = 'none';
                }

                // Adjust body padding for hidden nav
                document.body.style.paddingBottom = '0px';
            })();
        """.trimIndent()
        webView.evaluateJavascript(js, null)
    }

    @SuppressLint("SetTextI18n")
    private fun createBottomNavBar(): LinearLayout {
        val navBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setBackgroundColor(Color.parseColor("#1a1a1a"))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                dpToPx(72)
            )
            setPadding(0, dpToPx(8), 0, dpToPx(16))
            elevation = 16f
        }

        // Add divider line on top
        val divider = View(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                1
            )
            setBackgroundColor(Color.parseColor("#333333"))
        }

        val containerWithDivider = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }
        containerWithDivider.addView(divider)
        containerWithDivider.addView(navBar)

        data class TabItem(val id: String, val icon: String, val label: String)

        val tabs = listOf(
            TabItem("home", "🏠", "Home"),
            TabItem("create", "🎬", "Create"),
            TabItem("billing", "💳", "Billing"),
            TabItem("profile", "👤", "Profile")
        )

        for (tab in tabs) {
            val tabView = createTabView(tab.id, tab.icon, tab.label)
            navBar.addView(tabView)
        }

        return containerWithDivider
    }

    @SuppressLint("SetTextI18n")
    private fun createTabView(id: String, icon: String, label: String): LinearLayout {
        val isActive = id == currentTab
        val activeColor = Color.parseColor("#f4256a")
        val inactiveColor = Color.parseColor("#888888")

        val tabLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = android.view.Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.MATCH_PARENT,
                1f
            )
            setPadding(dpToPx(4), dpToPx(4), dpToPx(4), dpToPx(4))
            isClickable = true
            isFocusable = true
            tag = id
            setOnClickListener {
                onTabClicked(id)
            }
        }

        val iconView = TextView(this).apply {
            text = icon
            textSize = 22f
            gravity = android.view.Gravity.CENTER
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val labelView = TextView(this).apply {
            text = label
            textSize = 10f
            setTextColor(if (isActive) activeColor else inactiveColor)
            gravity = android.view.Gravity.CENTER
            typeface = android.graphics.Typeface.create("sans-serif-medium", android.graphics.Typeface.NORMAL)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                topMargin = dpToPx(2)
            }
        }

        tabLayout.addView(iconView)
        tabLayout.addView(labelView)

        return tabLayout
    }

    private fun onTabClicked(tabId: String) {
        currentTab = tabId
        val screenFolder = tabScreens[tabId] ?: return
        screenHistory.clear()
        loadScreen(screenFolder)

        // Update tab colors
        updateTabColors()
    }

    private fun updateTabColors() {
        val activeColor = Color.parseColor("#f4256a")
        val inactiveColor = Color.parseColor("#888888")

        // Find the nav bar (second child of the container with divider)
        val rootLayout = webView.parent as? LinearLayout ?: return
        for (i in 0 until rootLayout.childCount) {
            val child = rootLayout.getChildAt(i)
            if (child is LinearLayout && child != webView) {
                // This is the containerWithDivider
                for (j in 0 until child.childCount) {
                    val navChild = child.getChildAt(j)
                    if (navChild is LinearLayout) {
                        for (k in 0 until navChild.childCount) {
                            val tabView = navChild.getChildAt(k) as? LinearLayout ?: continue
                            val tabId = tabView.tag as? String ?: continue
                            val isActive = tabId == currentTab
                            // Update label color (second child)
                            if (tabView.childCount >= 2) {
                                val labelView = tabView.getChildAt(1) as? TextView
                                labelView?.setTextColor(if (isActive) activeColor else inactiveColor)
                            }
                        }
                    }
                }
            }
        }
    }

    private fun dpToPx(dp: Int): Int {
        return (dp * resources.displayMetrics.density).toInt()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else if (screenHistory.size > 1) {
            screenHistory.removeLastOrNull()
            val previousScreen = screenHistory.lastOrNull()
            if (previousScreen != null) {
                webView.loadUrl("file:///android_asset/stitch/$previousScreen/code.html")
            } else {
                super.onBackPressed()
            }
        } else {
            super.onBackPressed()
        }
    }
}
