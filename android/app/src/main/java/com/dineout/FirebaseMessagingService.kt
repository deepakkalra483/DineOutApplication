package com.dineout

import android.app.ActivityManager
import android.app.KeyguardManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    private val TAG = "MyFirebaseService"
    private val CHANNEL_ID = "notification_channel"

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        if (remoteMessage.data.isNotEmpty()) {
            val dataMap = HashMap(remoteMessage.data)
            if (FullScreenActivity.isActivityOpen) {
                // Send a broadcast to update UI instead of opening the activity
                val intent = Intent("NEW_INCOMING_CALL")
                intent.putExtra("notification_data", dataMap)
                sendBroadcast(intent)  // Send a system-wide broadcast
                val screenIntent = Intent(this, FullScreenActivity::class.java)
                screenIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                screenIntent.putExtra("notification_data", dataMap)
                startActivity(screenIntent)
            }else {

                val intent = Intent(this, FullScreenActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                intent.putExtra("notification_data", dataMap)  // Pass extra data

                // Important: Start Activity manually in case of a killed app
                startActivity(intent)
            }
            // Show Notification for additional backup
            showFullScreenNotification(remoteMessage)
        }
        return
        Log.d(TAG, "Message received: ${remoteMessage.data}")
        val dataMap = HashMap(remoteMessage.data)
        // Wake up the device
        wakeUpDevice()
        if (isServiceRunning(IncomingCallService::class.java)){
            Log.d("service run", "yes alredy running")
            val intent = Intent("NEW_INCOMING_CALL")
            intent.putExtra("notification_data", dataMap)
            sendBroadcast(intent)
        }else{
            Log.d("service not run", "no service running")
            val serviceIntent = Intent(this, IncomingCallService::class.java).apply {
                putExtra("notification_data",dataMap)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
        }


        // Show full-screen notification
//        showFullScreenNotification(remoteMessage)
    }

//    private fun wakeUpDevice() {
//        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
//        val wakeLock = powerManager.newWakeLock(
//            PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
//            "MyApp:WakeLock"
//        )
//
//        wakeLock.acquire(5000) // Keep the screen awake for 5 seconds
//
//        val keyguardManager = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
//        val keyguardLock = keyguardManager.newKeyguardLock("MyApp:KeyguardLock")
////        keyguardLock.disableKeyguard() // Unlock the screen (Deprecated but still works in some cases)
//    }

    private fun isAppRunning(): Boolean {
        val activityManager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val appProcesses = activityManager.runningAppProcesses ?: return false

        val packageName = packageName
        for (process in appProcesses) {
            if (process.processName == packageName && process.importance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND) {
                return true // App is in foreground
            }
        }
        return false // App is either background or killed
    }

    private fun wakeUpDevice() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK or
                    PowerManager.ACQUIRE_CAUSES_WAKEUP or
                    PowerManager.ON_AFTER_RELEASE,
            "MyApp:WakeLock"
        )
        wakeLock.acquire(5000) // Wake up device for 3 seconds

        val keyguardManager = getSystemService(KeyguardManager::class.java)

    }

    private fun isServiceRunning(serviceClass: Class<*>): Boolean {
        val manager = getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        for (service in manager.getRunningServices(Int.MAX_VALUE)) {
            if (serviceClass.name == service.service.className) {
                return true
            }
        }
        return false
    }

    private fun showFullScreenNotification(remoteMessage: RemoteMessage) {
        val title = remoteMessage.notification?.title ?: "Incoming Order"
        val message = remoteMessage.notification?.body ?: "You have a new order."

        val intent = Intent(this, FullScreenActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Create Notification Channel for Android 8+ (API 26+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "High Priority Notifications", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(pendingIntent, true)
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .build()

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.notify(1, notification)
    }
}