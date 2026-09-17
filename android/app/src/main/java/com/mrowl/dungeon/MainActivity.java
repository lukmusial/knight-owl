package com.mrowl.dungeon;

import android.os.Bundle;
import android.view.View;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        hideNavigationBar();
    }

    @Override
    public void onResume() {
        super.onResume();
        hideNavigationBar();
        dispatchLifecycleEvent("app-resume");
    }

    @Override
    public void onPause() {
        // The WebView keeps Web Audio (music, effects) and TTS running in the
        // background; AppLifecycle (www/js/modules/lifecycle.js) idles the game
        dispatchLifecycleEvent("app-pause");
        super.onPause();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        // Dialogs, the keyboard or returning from another app can bring the bar back
        if (hasFocus) hideNavigationBar();
    }

    private void dispatchLifecycleEvent(String name) {
        if (bridge == null || bridge.getWebView() == null) return;
        bridge.getWebView().evaluateJavascript(
            "window.dispatchEvent(new Event('" + name + "'));", null);
    }

    /**
     * Immersive mode for the game: the OS navigation bar is hidden and only
     * reappears temporarily when the user swipes in from the screen edge.
     */
    private void hideNavigationBar() {
        View decor = getWindow().getDecorView();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), decor);
        if (controller == null) return;
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.navigationBars());
    }
}
