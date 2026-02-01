package com.dineout
import android.view.LayoutInflater
import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import android.widget.Button
import android.media.MediaPlayer



class OrderAdapter(
    context: Context,
    private val items: List<OrderItem>
) : ArrayAdapter<OrderItem>(context, 0, items) {
    private var mediaPlayer: MediaPlayer? = null
    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view = convertView ?: LayoutInflater.from(context)
            .inflate(R.layout.order_item_row, parent, false)


        val textItem = view.findViewById<TextView>(R.id.textItem)
        val playButton = view.findViewById<Button>(R.id.btnPlayAudio)

        val item = items[position]

        if (item.id == "audio" && item.type == "audio" && !item.audioUrl.isNullOrEmpty()) {
            // 🎙 AUDIO ITEM
            textItem.visibility = View.GONE
            playButton.visibility = View.VISIBLE

            playButton.setOnClickListener {

                if (mediaPlayer?.isPlaying == true) {
                    mediaPlayer?.pause()
                    playButton.text = "▶ Play"
                    return@setOnClickListener
                }

                mediaPlayer?.release()

                mediaPlayer = MediaPlayer().apply {
                    setDataSource(item.audioUrl)
                    prepareAsync()
                    setOnPreparedListener {
                        it.start()
                        playButton.text = "⏸ Pause"
                    }
                    setOnCompletionListener {
                        playButton.text = "▶ Play"
                    }
                }
            }

        } else {
            // 📝 NORMAL TEXT ITEM
            playButton.visibility = View.GONE
            textItem.visibility = View.VISIBLE
            textItem.text = if (item.id == "audio") {
                "Message instruction: ${item.audioUrl}"
            } else {
                "${item.quantity} × ${item.name}"
            }
        }

        return view
    }
}