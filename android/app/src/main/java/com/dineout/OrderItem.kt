package com.dineout

data class OrderItem(
    val id: String,
    val name: String,
    val quantity: Int,
    val type: String?,      // "audio" or "text"
    val audioUrl: String?   // only for audio
)