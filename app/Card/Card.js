import React, {useEffect} from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const {height: DEVICE_HEIGHT, width: DEVICE_WIDTH} = Dimensions.get('window');

const HEIGHT = 280,
  WIDTH = 250,
  MARGIN_TOP = 80,
  TITLE_HEIGHT = 50;

const X_OFFSET = 20,
  Y_OFFSET = 20;

const Card = ({
  i,
  name,
  backgroundColor,
  onDelete,
  translateY,
  isExpanded,
  onExpand,
  onCollapse,
}) => {
  const xAnimatedValue = new Animated.Value(0);

  //WHEN CARD EXPANDED
  const expandAnimatedValue = new Animated.Value(0);
  const translateToCenterAnimatedValue = new Animated.Value(0);
  const collapseAnimatedValue = new Animated.Value(0);

  const {panHandlers: removeCardPanHandlers} = PanResponder.create({
    onPanResponderTerminationRequest: (event, gestureState) => false,
    onStartShouldSetPanResponder: (event, gestureState) => false,
    onMoveShouldSetPanResponder: (event, {dx, dy}) =>
      dx > X_OFFSET || dx < -X_OFFSET,
    onPanResponderMove: Animated.event([
      null,
      {dx: xAnimatedValue, useNativeDriver: true},
      ,
    ]),
    onPanResponderRelease: (event, gestureState) => {
      const {dx, dy} = gestureState;

      if (dx > WIDTH / 2 || dx < -WIDTH / 2) {
        Animated.timing(xAnimatedValue, {
          duration: 100,
          toValue: dx > WIDTH / 2 ? WIDTH : -WIDTH,
          useNativeDriver: true,
        }).start(() => onDelete(i));
      } else {
        Animated.spring(xAnimatedValue, {
          toValue: 0,
          duration: 1,
          useNativeDriver: true,
        }).start(() => {});
      }
    },
  });

  const {panHandlers: expandCardPanHandlers} = PanResponder.create({
    onMoveShouldSetPanResponder: (event, {dx, dy}) => dy > Y_OFFSET,
    onPanResponderTerminationRequest: (event, gestureState) => false,
    onPanResponderMove: Animated.event([
      null,
      {dy: collapseAnimatedValue, useNativeDriver: true},
      ,
    ]),
    onPanResponderRelease: (event, gestureState) => {
      const {dx, dy} = gestureState;
      if (dy > HEIGHT / 2) {
        Animated.sequence([
          Animated.timing(collapseAnimatedValue, {
            toValue: HEIGHT,
            duration: 10,
            useNativeDriver: true,
          }),
          Animated.spring(translateToCenterAnimatedValue, {
            toValue: 0,
            speed: 20,
            // duration: 20,
            // friction: 10,
            useNativeDriver: true,
          }),
        ]).start(() => onCollapse(i));
      } else {
        Animated.spring(collapseAnimatedValue, {
          toValue: 0,
          speed: 20,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    if (isExpanded) {
      Animated.sequence([
        Animated.timing(translateToCenterAnimatedValue, {
          toValue: 1,
          duration: 10,
          useNativeDriver: true,
        }),
        Animated.spring(expandAnimatedValue, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  });

  const opacity = xAnimatedValue.interpolate({
    inputRange: [-WIDTH, 0, WIDTH],
    outputRange: [0, 1, 0],
  });

  const transform = !isExpanded
    ? [
        {
          translateX: xAnimatedValue.interpolate({
            inputRange: [-WIDTH, 0, WIDTH],
            outputRange: [-WIDTH, 0, WIDTH],
          }),
        },
        {translateY},
        {
          scaleY: xAnimatedValue.interpolate({
            inputRange: [-WIDTH, 0, WIDTH],
            outputRange: [0.4, 1, 0.4],
          }),
        },
      ]
    : [
        // CARD EXPANDED
        {
          // to translate card to center
          translateY: translateToCenterAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, DEVICE_HEIGHT / 2 - (HEIGHT / 2 + MARGIN_TOP * i)],
            extrapolate: 'clamp',
          }),
        },
        {
          scaleX: Animated.divide(
            expandAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, DEVICE_WIDTH / WIDTH],
              extrapolate: 'clamp',
            }),
            collapseAnimatedValue.interpolate({
              inputRange: [0, HEIGHT],
              outputRange: [1, DEVICE_WIDTH / WIDTH],
              extrapolate: 'clamp',
            }),
          ),
        },
        {
          scaleY: Animated.divide(
            expandAnimatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, DEVICE_HEIGHT / HEIGHT],
              extrapolate: 'clamp',
            }),
            collapseAnimatedValue.interpolate({
              inputRange: [0, HEIGHT],
              outputRange: [1, DEVICE_HEIGHT / HEIGHT],
              extrapolate: 'clamp',
            }),
          ),
        },
      ];

  return (
    <Animated.View
      {...(!isExpanded ? removeCardPanHandlers : expandCardPanHandlers)}
      style={[
        Styles.container,
        {
          backgroundColor,
          marginTop: MARGIN_TOP * i,
          opacity,
          transform,
          zIndex: isExpanded ? 1 : 0,
        },
      ]}>
      <TouchableOpacity
        onPress={() => !isExpanded && onExpand(i)}
        activeOpacity={1}
        style={[{flex: 1}]}>
        <Text style={Styles.title}>{name}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const Styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    width: WIDTH,
    borderRadius: 5,
    borderWidth: 1,
    position: 'absolute',
  },
  title: {
    fontSize: 17,
    alignSelf: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
});

export {Card, HEIGHT, WIDTH, MARGIN_TOP, TITLE_HEIGHT};
