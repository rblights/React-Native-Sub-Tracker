import { formatCurrency } from '@/lib/utils'
import React from 'react'
import { Image, Text, View } from 'react-native'

// Add daysLeft to your type/interface if you haven't already
const UpcomingSubscriptionCard = ({name, price, icon, currency, daysLeft}: any) => {
  return (
    <View className='upcoming-card'>
      <View className='upcoming-row'>
        <Image 
            source={icon} className='upcoming-icon'
        />
        <View>
            <Text className='upcoming-price'>{formatCurrency(price, currency)}</Text>
            <Text className='upcoming-meta' numberOfLines={1}>
                {daysLeft > 1
                    ? `${daysLeft} Days Left`
                    : daysLeft === 1
                        ? '1 Day Left'
                        : 'Last Day'}
            </Text>
        </View>
      </View>
      <Text className='upcoming-name' numberOfLines={1}>
        {name}
      </Text>
    </View>
  )
}

export default UpcomingSubscriptionCard