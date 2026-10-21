import re, os, glob, math, wave, struct
from PIL import Image, ImageDraw
R = 'android/app/src/main/res/'

# ---- black splash + launcher background ----
for f in glob.glob(R + '**/splash.png', recursive=True): os.remove(f)
open(R + 'drawable/splash.xml', 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android"><solid android:color="#FAF0CA"/></shape>\n')
open(R + 'values/ic_launcher_background.xml', 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0D3B66</color>\n</resources>\n')

# ---- reminder ring sound (res/raw/reminder.wav), used by the notification channel ----
os.makedirs(R + 'raw', exist_ok=True)
def make_chime(path):
    sr = 22050; total = 3.2; n = int(sr * total); buf = [0.0] * n
    notes = [(659.25, 0.0), (783.99, 0.22), (1046.5, 0.44), (1318.5, 0.95), (1046.5, 1.55), (1318.5, 1.8), (1568.0, 2.05)]
    for f, t0 in notes:
        s0 = int(t0 * sr)
        for i in range(int(1.3 * sr)):
            if s0 + i >= n: break
            t = i / sr
            env = math.exp(-3.4 * t) * min(1.0, t / 0.006)
            v = math.sin(2*math.pi*f*t) + 0.35*math.sin(2*math.pi*f*2*t) + 0.12*math.sin(2*math.pi*f*3*t)
            buf[s0 + i] += v * env * 0.26
    w = wave.open(path, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(b''.join(struct.pack('<h', int(max(-1.0, min(1.0, x)) * 32000)) for x in buf)); w.close()
make_chime(R + 'raw/reminder.wav')

# ---- theme: black status & navigation bars ----
p = R + 'values/styles.xml'; s = open(p).read()
s = s.replace('<item name="android:background">@null</item>', '<item name="android:background">@null</item>\n        <item name="android:statusBarColor">#FAF0CA</item>\n        <item name="android:navigationBarColor">#FAF0CA</item>\n        <item name="android:windowBackground">#FAF0CA</item>')
open(p, 'w').write(s)

# ---- manifest permissions ----
p = 'android/app/src/main/AndroidManifest.xml'; s = open(p).read()
s = s.replace('<uses-permission android:name="android.permission.INTERNET" />', '''<uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" android:maxSdkVersion="32" />''')
open(p, 'w').write(s)

# ---- launcher icons from the PWA icon ----
src = Image.open('www/icons/icon-512.png').convert('RGB')
fg = Image.open('www/icons/maskable-512.png').convert('RGB')
for d, legacy, adaptive in [('mdpi',48,108),('hdpi',72,162),('xhdpi',96,216),('xxhdpi',144,324),('xxxhdpi',192,432)]:
    a = src.resize((legacy, legacy), Image.LANCZOS)
    a.save(f'{R}mipmap-{d}/ic_launcher.png')
    m = Image.new('L', (legacy, legacy), 0); ImageDraw.Draw(m).ellipse([0,0,legacy-1,legacy-1], fill=255)
    r = a.copy(); r.putalpha(m); r.save(f'{R}mipmap-{d}/ic_launcher_round.png')
    fg.resize((adaptive, adaptive), Image.LANCZOS).save(f'{R}mipmap-{d}/ic_launcher_foreground.png')

# ---- native plugin: lets the app colour the status bar, navigation bar and window per theme ----
JAVA_DIR = os.path.dirname(glob.glob('android/app/src/main/java/**/MainActivity.java', recursive=True)[0])
PKG = JAVA_DIR.split('android/app/src/main/java/')[1].replace('/', '.')
open(JAVA_DIR + '/NavBarPlugin.java', 'w').write('''package PKG_NAME;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.Window;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NavBar")
public class NavBarPlugin extends Plugin {
    @PluginMethod
    public void set(final PluginCall call) {
        final String hex = call.getString("color", "#FAF0CA");
        final Boolean lb = call.getBoolean("light", false);
        final boolean light = lb != null && lb.booleanValue();
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    Window w = getActivity().getWindow();
                    int c = Color.parseColor(hex);
                    w.setStatusBarColor(c);
                    w.setNavigationBarColor(c);
                    w.setBackgroundDrawable(new ColorDrawable(c));
                    WindowInsetsControllerCompat ctl = WindowCompat.getInsetsController(w, w.getDecorView());
                    ctl.setAppearanceLightStatusBars(light);
                    ctl.setAppearanceLightNavigationBars(light);
                    call.resolve();
                } catch (Exception e) {
                    call.reject(String.valueOf(e.getMessage()));
                }
            }
        });
    }
}
'''.replace('PKG_NAME', PKG))
open(JAVA_DIR + '/MainActivity.java', 'w').write('''package PKG_NAME;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NavBarPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
'''.replace('PKG_NAME', PKG))
