package app

import android.app.ActivityManager
import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceMemoryModule : Module() {
  override fun definition() = ModuleDefinition {
    Function("getSystemMemoryInfo") {
      val context = appContext.reactContext ?: return@Function null

      val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
      val memoryInfo = ActivityManager.MemoryInfo()
      activityManager.getMemoryInfo(memoryInfo)

      val totalMem = memoryInfo.totalMem
      val availMem = memoryInfo.availMem
      val usedMem = totalMem - availMem

      return@Function mapOf(
        "availableMemory" to availMem,
        "usedMemory" to usedMem
      )
    }
  }
}