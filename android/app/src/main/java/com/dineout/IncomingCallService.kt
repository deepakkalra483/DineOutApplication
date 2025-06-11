package com.dineout

import android.app.*
import android.content.BroadcastReceiver
import android.content.ContentValues.TAG
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

class IncomingCallService : Service() {

    companion object {
        private var isCallActive = false  // Keeps track of active call
    }


    override fun onCreate() {
        super.onCreate()
//        ContextCompat.registerReceiver(
//            this,
//            newCallReceiver,
//            IntentFilter("NEW_INCOMING_CALL"),
//            ContextCompat.RECEIVER_NOT_EXPORTED
//        )
//        registerReceiver(newCallReceiver, IntentFilter("NEW_INCOMING_CALL"))
//        val data = intent?.getSerializableExtra("notification_data") as? HashMap<String, String>
//        startForegroundServiceWithNotification()
//        if (data != null) {
//            startForegroundServiceWithNotification(data)
//        } else {
//            Log.e(TAG, "No notification data received!")
//            stopSelf()
//        }
    }


    private fun startForegroundServiceWithNotification(data: HashMap<String, String>) {
        val channelId = "incoming_call_channel"
        createNotificationChannel(channelId)
        Log.d("in incming service", "reach")
        val fullScreenIntent = Intent(this, FullScreenActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("notification_data", data)
        }
        startActivity(fullScreenIntent)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, fullScreenIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val acceptIntent = Intent(this, CallActionReceiver::class.java).apply {
            action = "CALL_ACCEPT"
        }
        val acceptPendingIntent = PendingIntent.getBroadcast(this, 1, acceptIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        val declineIntent = Intent(this, CallActionReceiver::class.java).apply {
            action = "CALL_DECLINE"
        }
        val declinePendingIntent = PendingIntent.getBroadcast(this, 2, declineIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Incoming Call")
            .setContentText("Tap to answer")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setFullScreenIntent(pendingIntent, true)
            .setAutoCancel(true)
            .build()

        startForeground(1, notification)
    }

    private fun createNotificationChannel(channelId: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Incoming Call Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private val newCallReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val data = intent?.getSerializableExtra("notification_data") as? HashMap<String, String>
            if (data != null) {
                sendNewCallBroadcast(data)  // Notify FullScreenActivity
            }
        }
    }

    private fun sendNewCallBroadcast(data: HashMap<String, String>) {
        val intent = Intent("NEW_INCOMING_CALL")
        intent.putExtra("notification_data", data)
        sendBroadcast(intent)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "IncomingCallService started")
        // Retrieve the data from the intent
        val data = intent?.getSerializableExtra("notification_data") as? HashMap<String, String>

        if (data != null) {
            if (isCallActive) {
                // ✅ Already on a call → Send broadcast to FullScreenActivity
                sendNewCallBroadcast(data)
            } else {
                // 🚀 No active call → Start call normally
                isCallActive = true
                startForegroundServiceWithNotification(data)
            }
        } else {
            Log.e(TAG, "No notification data received!")
            stopSelf()  // Stop service if no data
        }

        return START_NOT_STICKY
    }

//    override fun onDestroy() {
//        super.onDestroy()
//        isCallActive = false
//        unregisterReceiver(newCallReceiver)  // Unregister receiver
//    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}