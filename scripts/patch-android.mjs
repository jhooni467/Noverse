import { mkdir, writeFile } from "node:fs/promises";
const file = "android/app/src/main/java/com/noverse/gamehub/MainActivity.java";
await mkdir("android/app/src/main/java/com/noverse/gamehub", { recursive: true });
await writeFile(file, `package com.noverse.gamehub;

import android.graphics.Color;
import android.os.Build;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(android.os.Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().setNavigationBarColor(Color.BLACK);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      getWindow().setNavigationBarContrastEnforced(false);
    }
  }
}
`);
console.log("NOVERSE Android system bars configured.");
