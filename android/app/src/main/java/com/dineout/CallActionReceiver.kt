package com.dineout

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class CallActionReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            "CALL_ACCEPT" -> {
                val callIntent = Intent(context, FullScreenActivity::class.java)
                callIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(callIntent)
            }
            "CALL_DECLINE" -> {
                val serviceIntent = Intent(context, IncomingCallService::class.java)
                context.stopService(serviceIntent)
                val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(1) // Remove the notification
            }
        }
    }
}