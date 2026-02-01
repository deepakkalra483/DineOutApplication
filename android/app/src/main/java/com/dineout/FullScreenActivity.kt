package com.dineout

import DatabaseHelper
import android.app.Activity
import android.app.ActivityManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.ContentValues.TAG
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.media.MediaPlayer
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ListView
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject

data class Item(val name: String, val quantity: Int)
class FullScreenActivity : Activity() {
    companion object {
        var isActivityOpen = false
    }
    private var mediaPlayer: MediaPlayer? = null

    private lateinit var waitingCallButton: Button
    private val updateCallUIReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val data = intent?.getSerializableExtra("notification_data") as? HashMap<String, String>
            if (data != null) {
                val tableNumber = data["table"]
                if (tableNumber.isNullOrBlank() ||
                    tableNumber == "undefined" ||
                    tableNumber == "null" ||
                    tableNumber == "Unknown Caller"
                ) {
                    Log.e("FullScreenActivity", "Invalid table, DB insert skipped")
                    return
                }
                val userId = data["userId"] ?: "Unknown"
                val token = data["token"] ?: ""
                val jsonString = data["items"] ?:"[]"
                val message = data["message"] ?: "No Instructions"
                val name=data["name"] ?: ""
                val mobile=data["mobile"] ?: ""
                databaseHelper.insertOrder(tableNumber, jsonString ?: "[]", token, "0", userId,message,name,mobile)

                // Ensure UI updates run on the main thread
                (context as? Activity)?.runOnUiThread {
                    waitingCallButton.visibility = View.VISIBLE  // Show "Call Waiting" button
                    doneCallButton.visibility = View.GONE  // Hide "Done" button
                    waitingCallButton.setOnClickListener {
                        answerCall()
//                    Toast.makeText(this@FullScreenActivity, "Waiting call accepted", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
    private var isCallActive = false  // Tracks active call status

    private  lateinit var doneCallButton:Button
    private lateinit var ringtone: Ringtone
    private lateinit var vibrator: Vibrator
    val databaseHelper = DatabaseHelper(this)
    private val CHANNEL_ID = "notification_channel"
    private val handler = Handler(Looper.getMainLooper())
    private val autoDismissRunnable = Runnable { endCall() }

    override fun onCreate(savedInstanceState: Bundle?) {
        isActivityOpen = true
        Log.d("fullscreen", "App is running, launching main callactivity:")
        Log.d(TAG, "onCreate: Activity created")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }
        super.onCreate(savedInstanceState)
        ContextCompat.registerReceiver(
        this, updateCallUIReceiver,
             IntentFilter("NEW_INCOMING_CALL"),
              ContextCompat.RECEIVER_NOT_EXPORTED
           )


        // Set window flags to ensure full-screen display
        window.addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_FULLSCREEN
        )
        setContentView(R.layout.activity_full_screen)
        val notificationData = intent.getSerializableExtra("notification_data") as? HashMap<String, String>
        val tableNumber = notificationData?.get("table")
        if (tableNumber.isNullOrBlank() ||
            tableNumber == "undefined" ||
            tableNumber == "null" ||
            tableNumber == "Unknown Caller"
        ) {
            Log.e("FullScreenActivity", "Invalid table, DB insert skipped")
            return
        }
        val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val roomsStr = prefs.getString("rooms", "[]") ?: "[]"
        val jsonArray = JSONArray(roomsStr)

        var roomName: String? = null
        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            if (obj.getString("id") == tableNumber) {
                roomName = obj.getString("room")
                break
            }
        }

        val textView = findViewById<TextView>(R.id.table)
        if (roomName != null) {
            textView.text = "New order from\n$roomName"
        } else {
            textView.text = "New order from\n$tableNumber"
        }

        val userId=notificationData?.get("userId") ?: "Unknown Caller"
        val token=notificationData?.get("token") ?: ""
        val message=notificationData?.get("message") ?: "No Instructions"
        val name=notificationData?.get("name") ?: ""
        val mobile=notificationData?.get("mobile") ?: ""
//        findViewById<TextView>(R.id.table).text = "New order from\n$tableNumber"
        doneCallButton=findViewById(R.id.btnAccept)
        waitingCallButton = findViewById(R.id.btnWaitingCall)
        waitingCallButton.visibility = View.GONE

        val jsonString = notificationData?.get("items")
        databaseHelper.insertOrder(tableNumber, jsonString ?: "",token,"1",userId,message,name,mobile)
        // Parse JSON using JSONArray (No Gson needed!)

//        new code start from here -------
        val itemList = mutableListOf<OrderItem>()

        if (!jsonString.isNullOrEmpty()) {
            val jsonArray = JSONArray(jsonString)

            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)

                val id = obj.optString("id")
                val name = obj.optString("name")
                val quantity = obj.optInt("quantity", 0)
                val type = obj.optString("type", "text")
                val audioUrl = obj.optString("audioUrl", null)

                itemList.add(
                    OrderItem(
                        id = id,
                        name = name,
                        quantity = quantity,
                        type = type,
                        audioUrl = audioUrl
                    )
                )
            }
        }

        val listView: ListView = findViewById(R.id.listViewOrders)
        val adapter = OrderAdapter(this, itemList)
        listView.adapter = adapter

//        End here this is replace for audio player in list --------

//        Comment code -----------from here
//        val itemList = mutableListOf<Item>()
//        if (!jsonString.isNullOrEmpty()) {
//            val jsonArray = JSONArray(jsonString)
//            for (i in 0 until jsonArray.length()) {
//                val obj = jsonArray.getJSONObject(i)
//                val name = obj.getString("name")
//                val quantity = obj.getInt("quantity")
//                itemList.add(Item(name, quantity))
//            }
//        }
//
//        // Convert items to a displayable list
//        val listView: ListView = findViewById(R.id.listViewOrders)
//        val displayList = itemList.map { "${it.quantity} ⨯ ${it.name}" }
//        val adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, displayList)
//        listView.adapter = adapter


//        at here -----------

        mediaPlayer = MediaPlayer.create(this, R.raw.telephone_ring)
        mediaPlayer?.start()
//        val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
//        ringtone = RingtoneManager.getRingtone(applicationContext, uri)
//        ringtone.play()

        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibManager = getSystemService(VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibManager.defaultVibrator
        } else {
            getSystemService(VIBRATOR_SERVICE) as Vibrator
        }

        val vibrationPattern = longArrayOf(0, 1000, 1000)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // For API 26+ (Android 8.0+)
            vibrator?.vibrate(VibrationEffect.createWaveform(vibrationPattern, 0)) // 0 = Repeat forever
        } else {
            // For Older Android Versions
            vibrator?.vibrate(vibrationPattern, 0) // Deprecated, but works on older devices
        }


        // Auto-dismiss after 30 seconds
//        handler.postDelayed(autoDismissRunnable, 30000)
        findViewById<Button>(R.id.btnAccept).setOnClickListener {
            acceptCall()
//            answerCall()
        }

        findViewById<Button>(R.id.btnDecline).setOnClickListener {
            endCall()
        }
    }

    private  fun showNotifiation(){
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
            .setContentTitle("Missed Orer ")
            .setContentText("Tap to view order")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .build()

        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.notify(1, notification)
    }

    private fun acceptCall(){
        mediaPlayer?.stop()
//        ringtone.stop()
        vibrator.cancel()
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(1)
        finish()
//        try {
//            unregisterReceiver(newCallReceiver) // Unregister the receiver
//        } catch (e: IllegalArgumentException) {
//            Log.e(TAG, "Receiver not registered: ${e.message}")
//        }

//        stopService(Intent(this, IncomingCallService::class.java))
    }

    private fun answerCall() {
        mediaPlayer?.stop()
//        ringtone.stop()
        vibrator.cancel()
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(1)
        val context=applicationContext ?: return
        val packageName=context.packageName
        val focusIntent=packageManager.getLaunchIntentForPackage(packageName)?.cloneFilter() ?: return
        val intent = Intent(this, MainActivity::class.java)
        if(isTaskRoot){
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            startActivity(intent)
        }else{
            intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
//            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            startActivity(intent)
        }
//        finish()
    }

    private val newCallReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val data = intent?.getSerializableExtra("notification_data") as? HashMap<String, String>
            if (data != null) {
                val tableNumber = data?.get("table")
                if (tableNumber.isNullOrBlank() ||
                    tableNumber == "undefined" ||
                    tableNumber == "null" ||
                    tableNumber == "Unknown Caller"
                ) {
                    Log.e("FullScreenActivity", "Invalid table, DB insert skipped")
                    return
                }
                val userId=data?.get("userId") ?: "Unknown"
                val token=data?.get("token") ?: ""
                val jsonString = data?.get("items")
                val message =data?.get("message") ?: "No Instructions"
                val name=data?.get("name") ?: ""
                val mobile=data?.get("number") ?: ""
                databaseHelper.insertOrder(tableNumber, jsonString ?: "",token,"0",userId,message,name,mobile)
                // Show Waiting Call button
                waitingCallButton.visibility = View.VISIBLE
                doneCallButton.visibility=View.GONE
                waitingCallButton.setOnClickListener {
                    answerCall()
//                    Toast.makeText(this@FullScreenActivity, "Waiting call accepted", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

//    override fun onResume() {
//        super.onResume()
//    ContextCompat.registerReceiver(
//    this,
//    newCallReceiver,
//    IntentFilter("NEW_INCOMING_CALL"),
//    ContextCompat.RECEIVER_NOT_EXPORTED
//    )
//        val filter = IntentFilter("NEW_INCOMING_CALL")
//        registerReceiver(newCallReceiver, filter)
//    }

//    override fun onPause() {
//        super.onPause()
//        unregisterReceiver(newCallReceiver)
//    }

    private fun endCall() {
        mediaPlayer?.stop()
//        ringtone.stop()
        vibrator.cancel()
//        unregisterReceiver(newCallReceiver)
//        finish()
//        stopService(Intent(this, IncomingCallService::class.java))
//        showNotifiation()
    }
    override fun onDestroy() {
        super.onDestroy()
        isActivityOpen = false
        unregisterReceiver(updateCallUIReceiver)  // Unregister to prevent memory leaks
    }
//    override fun onDestroy() {
//        super.onDestroy()
//        ringtone.stop()
//        vibrator.cancel()
//        try {
//            unregisterReceiver(newCallReceiver) // Unregister the receiver
//        } catch (e: IllegalArgumentException) {
//            Log.e(TAG, "Receiver not registered: ${e.message}")
//        }
//        stopService(Intent(this, IncomingCallService::class.java)) // Stop service
//    }


}