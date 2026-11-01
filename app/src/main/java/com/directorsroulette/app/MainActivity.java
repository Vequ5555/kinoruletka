package com.directorsroulette.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private WebView web;
    private String exportData;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xff101017);
        getWindow().setNavigationBarColor(0xff101017);
        web = new WebView(this);
        android.widget.FrameLayout root = new android.widget.FrameLayout(this);
        root.addView(web);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.displayCutout());
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
                return insets;
            });
        }
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.addJavascriptInterface(new Backup(), "AndroidBackup");
        web.setWebChromeClient(new android.webkit.WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) { return loader.shouldInterceptRequest(request.getUrl()); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return true; }
        });
        setContentView(root);
        root.requestApplyInsets();
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }
    private class Backup {
        @JavascriptInterface public void haptic() { runOnUiThread(() -> web.performHapticFeedback(android.view.HapticFeedbackConstants.CONFIRM)); }
        @JavascriptInterface public void exportJson(String data) {
            runOnUiThread(() -> {
                exportData = data;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE,"directors-roulette-backup.json");
                startActivityForResult(i, 1);
            });
        }
        @JavascriptInterface public void importJson() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json");
                startActivityForResult(i, 2);
            });
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request,result,data);
        if (result != RESULT_OK || data == null || data.getData() == null) return;
        Uri uri=data.getData();
        try {
            if (request == 1 && exportData != null) {
                try (OutputStream out=getContentResolver().openOutputStream(uri,"wt")) { if(out==null) throw new Exception(); out.write(exportData.getBytes(StandardCharsets.UTF_8)); }
                exportData=null;
                Toast.makeText(this,"Резервная копия сохранена",Toast.LENGTH_SHORT).show();
            } else if (request == 2) {
                try (InputStream in=getContentResolver().openInputStream(uri); ByteArrayOutputStream out=new ByteArrayOutputStream()) {
                    if(in==null) throw new Exception(); byte[] buffer=new byte[4096]; int n,total=0;
                    while((n=in.read(buffer))!=-1) { total+=n; if(total>1000000) throw new Exception(); out.write(buffer,0,n); }
                    String json=new String(out.toByteArray(),StandardCharsets.UTF_8);
                    web.evaluateJavascript("window.receiveBackup("+JSONObject.quote(json)+")",null);
                }
            }
        } catch(Exception e) { Toast.makeText(this,"Не удалось обработать файл",Toast.LENGTH_LONG).show(); }
    }
    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
