package com.noverse.gamehub;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONException;

@CapacitorPlugin(
  name = "Updates",
  permissions = {
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
  }
)
public class UpdatesPlugin extends Plugin {
  private static final String CHANNEL_ID = "noverse_app_updates";

  @PluginMethod
  public void getInstalledVersions(PluginCall call) {
    JSArray packages = call.getArray("packageNames");
    JSObject versions = new JSObject();
    PackageManager manager = getContext().getPackageManager();
    if (packages != null) {
      for (int i = 0; i < packages.length(); i++) {
        try {
          String packageName = packages.getString(i);
          PackageInfo info = manager.getPackageInfo(packageName, 0);
          versions.put(packageName, info.versionName == null ? "0" : info.versionName);
        } catch (Exception ignored) { }
      }
    }
    JSObject result = new JSObject();
    result.put("versions", versions);
    call.resolve(result);
  }

  @PluginMethod
  public void requestNotificationPermission(PluginCall call) {
    if (Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED) {
      JSObject result = new JSObject(); result.put("granted", true); call.resolve(result); return;
    }
    requestPermissionForAlias("notifications", call, "notificationPermissionResult");
  }

  @PermissionCallback
  private void notificationPermissionResult(PluginCall call) {
    JSObject result = new JSObject();
    result.put("granted", getPermissionState("notifications") == PermissionState.GRANTED);
    call.resolve(result);
  }

  @PluginMethod
  public void showUpdateNotification(PluginCall call) {
    String title = call.getString("title", "Actualización disponible");
    String body = call.getString("body", "Hay nuevas versiones disponibles en NOVERSE.");
    int id = call.getInt("id", 116);
    NotificationManager manager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= 26) {
      NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Actualizaciones de aplicaciones", NotificationManager.IMPORTANCE_DEFAULT);
      channel.setDescription("Avisos de nuevas versiones de NOVERSE y AstralWorld.");
      manager.createNotificationChannel(channel);
    }
    Intent intent = new Intent(getContext(), getActivity().getClass());
    intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
    PendingIntent pending = PendingIntent.getActivity(getContext(), 116, intent,
      PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
    Notification.Builder builder = Build.VERSION.SDK_INT >= 26
      ? new Notification.Builder(getContext(), CHANNEL_ID)
      : new Notification.Builder(getContext());
    builder.setSmallIcon(getContext().getApplicationInfo().icon)
      .setContentTitle(title).setContentText(body).setStyle(new Notification.BigTextStyle().bigText(body))
      .setContentIntent(pending).setAutoCancel(true);
    manager.notify(id, builder.build());
    call.resolve();
  }
}
