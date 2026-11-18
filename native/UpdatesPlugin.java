package com.noverse.gamehub;

import android.Manifest;
import android.app.DownloadManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(
  name = "Updates",
  permissions = {
    @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
  }
)
public class UpdatesPlugin extends Plugin {
  private static final String CHANNEL_ID = "noverse_app_updates";
  private final Set<Long> openedDownloads = new HashSet<>();

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
  public void startDownloadAndInstall(PluginCall call) {
    String url = call.getString("url", "");
    String fileName = call.getString("fileName", "NOVERSE-app.apk");
    if (!url.startsWith("https://")) {
      call.reject("La descarga debe utilizar una URL HTTPS.");
      return;
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
        !getContext().getPackageManager().canRequestPackageInstalls()) {
      Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
        Uri.parse("package:" + getContext().getPackageName()));
      settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getActivity().startActivity(settings);
      JSObject result = new JSObject();
      result.put("status", "permission_required");
      call.resolve(result);
      return;
    }
    try {
      DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
      DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
      request.setTitle(fileName);
      request.setDescription("Descargando desde NOVERSE Store");
      request.setMimeType("application/vnd.android.package-archive");
      request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
      request.setAllowedOverMetered(true);
      request.setAllowedOverRoaming(false);
      request.setDestinationInExternalFilesDir(getContext(), Environment.DIRECTORY_DOWNLOADS, fileName);
      long id = manager.enqueue(request);
      JSObject result = new JSObject();
      result.put("status", "downloading");
      result.put("downloadId", id);
      call.resolve(result);
    } catch (Exception error) {
      call.reject("No se pudo iniciar la descarga del APK.", error);
    }
  }

  @PluginMethod
  public void getDownloadStatus(PluginCall call) {
    long id = call.getLong("downloadId", -1L);
    if (id < 0) { call.reject("ID de descarga no válido."); return; }
    DownloadManager manager = (DownloadManager) getContext().getSystemService(Context.DOWNLOAD_SERVICE);
    DownloadManager.Query query = new DownloadManager.Query().setFilterById(id);
    try (android.database.Cursor cursor = manager.query(query)) {
      if (cursor == null || !cursor.moveToFirst()) {
        JSObject missing = new JSObject(); missing.put("status", "missing"); call.resolve(missing); return;
      }
      int statusIndex = cursor.getColumnIndex(DownloadManager.COLUMN_STATUS);
      int reasonIndex = cursor.getColumnIndex(DownloadManager.COLUMN_REASON);
      int downloadedIndex = cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR);
      int totalIndex = cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES);
      long downloaded = downloadedIndex >= 0 ? cursor.getLong(downloadedIndex) : 0L;
      long total = totalIndex >= 0 ? cursor.getLong(totalIndex) : -1L;
      int progress = total > 0 ? (int) Math.min(100L, (downloaded * 100L) / total) : 0;
      int status = cursor.getInt(statusIndex);
      String state = "pending";
      if (status == DownloadManager.STATUS_RUNNING) state = "downloading";
      else if (status == DownloadManager.STATUS_PENDING) state = "pending";
      else if (status == DownloadManager.STATUS_PAUSED) state = "paused";
      else if (status == DownloadManager.STATUS_FAILED) state = "failed";
      else if (status == DownloadManager.STATUS_SUCCESSFUL) {
        state = "ready";
        if (!openedDownloads.contains(id)) {
          Uri apkUri = manager.getUriForDownloadedFile(id);
          if (apkUri != null) {
            Intent install = new Intent(Intent.ACTION_VIEW);
            install.setDataAndType(apkUri, "application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getActivity().startActivity(install);
            openedDownloads.add(id);
            state = "installer_opened";
          } else state = "failed";
        } else state = "installer_opened";
      }
      JSObject result = new JSObject();
      result.put("status", state);
      result.put("downloadedBytes", downloaded);
      result.put("totalBytes", total);
      result.put("progress", status == DownloadManager.STATUS_SUCCESSFUL ? 100 : progress);
      if (status == DownloadManager.STATUS_FAILED && reasonIndex >= 0) result.put("reason", cursor.getInt(reasonIndex));
      call.resolve(result);
    } catch (Exception error) {
      call.reject("No se pudo consultar la descarga.", error);
    }
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
