import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  LayoutAnimation,
  PanResponder,
  Animated,
} from 'react-native';

import Card, {HEIGHT, WIDTH, MARGIN_TOP, TITLE_HEIGHT} from './Card';

const Y_OFFSET = 20;

const getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CardList = () => {
  const [cardList, setCardList] = useState(
    Array.from(Array(5)).map((item, i) => ({
      id: `id_${i}`,
      name: `Card ${i + 1}`,
      isExpanded: false,
      backgroundColor: getRandomColor(),
    })),
  );

  const yAnimatedValue = new Animated.Value(0);

  const {panHandlers} = PanResponder.create({
    onMoveShouldSetPanResponder: (event, {dx, dy}) =>
      dy > Y_OFFSET || dy < -Y_OFFSET,
    onPanResponderMove: Animated.event([
      null,
      {dy: yAnimatedValue, useNativeDriver: true},
    ]),
    onPanResponderRelease: (event, gestureState) => {
      Animated.spring(yAnimatedValue, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  const onDelete = i => {
    LayoutAnimation.configureNext({
      duration: 700,
      //create: { type: 'linear', property: 'opacity' },
      update: {type: 'spring', springDamping: 0.5},
      //delete: { type: 'linear', property: 'opacity' }
    });
    setCardList(cardList.filter((card, index) => index !== i));
  };

  const onExpand = i => {
    setCardList(
      cardList.map((card, index) =>
        index === i ? {...card, isExpanded: true} : card,
      ),
    );
  };

  const onCollapse = i => {
    setCardList(
      cardList.map((card, index) =>
        index === i ? {...card, isExpanded: false} : card,
      ),
    );
  };

  return (
    <SafeAreaView>
      <View {...panHandlers} style={Styles.container}>
        {cardList.map(({id, backgroundColor, name, isExpanded}, i) => (
          <Card
            key={id}
            {...{
              i,
              id,
              name,
              backgroundColor,
              isExpanded,
              onDelete,
              onExpand,
              onCollapse,
            }}
            translateY={yAnimatedValue.interpolate({
              inputRange: [
                -TITLE_HEIGHT * i ||
                  -1 /** for first card to fix bug in interpolate between 0 and 0 */,
                0,
                HEIGHT,
              ],
              outputRange: [-TITLE_HEIGHT * i, 0, HEIGHT * i],
              extrapolate: 'clamp',
            })}
          />
        ))}
      </View>
    </SafeAreaView>
  );
};

const Styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
});

export default CardList;
