import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import FoodItem from './FoodItem';
import InstructionItem from './InstructionItem';
import { stopAudio } from './AudioController';
import { AppColors } from '../../utils/AppColors';

const OrderCard = ({ order, isNew }) => {
  const [playingUrl, setPlayingUrl] = useState(null);

  useEffect(() => {
    return () => stopAudio(setPlayingUrl);
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.time_text}>{timeAgo(order.time_stamp)}</Text>
        {/* <Text>{order.message}</Text> */}
      </View>

      {order.items.map((item, index) =>
        item.id === 'audio' ? (
          <InstructionItem
            key={`audio-${index}`}
            item={item}
            playingUrl={playingUrl}
            setPlayingUrl={setPlayingUrl}
          />
        ) : (
          <FoodItem key={`food-${index}`} item={item} />
        )
      )}

      {isNew && <Text style={styles.newBadge}>New Order</Text>}
    </View>
  );
};

export default OrderCard;

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    // borderRadius: 12,
    padding: 10,
    // marginVertical: 8,
    paddingTop: 5,
    borderBottomWidth: 0.5,
    borderStyle: 'dotted',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 3,
    // borderBottomWidth:0.3,

  },
  newBadge: {
    marginTop: 6,
    backgroundColor: '#8BB5BE',
    textAlign: 'center',
    fontSize: 12,
    padding: 4,
  },
  time_text: {
    color: AppColors.LIGHT_GRAY_TEXT,
    fontSize: 12
  }
};

const timeAgo = timestamp => {
  if (!timestamp) {
    return ``
  }
  // Convert SQLite timestamp (which is in UTC) to a Date object
  const utcDate = new Date(timestamp);

  // Convert UTC to IST (Indian Standard Time, UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Get the current time in IST
  const now = new Date();
  const timeDiff = now - istDate; // Difference in milliseconds

  // Convert time difference to seconds, minutes, hours, days
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // Format output
  if (seconds < 60) {
    return `${seconds} sec ago`;
  } else if (minutes < 60) {
    return `${minutes} min ago`;
  } else if (hours < 24) {
    return `${hours} hr ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};
