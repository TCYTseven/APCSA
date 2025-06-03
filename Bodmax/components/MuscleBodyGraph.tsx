import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Body, { ExtendedBodyPart } from 'react-native-body-highlighter';

const { width } = Dimensions.get('window');

interface MuscleBodyGraphProps {
  highlightedMuscles: ExtendedBodyPart[];
  gender?: 'male' | 'female';
  side?: 'front' | 'back';
  onBodyPartPress?: (slug: string, side?: 'left' | 'right') => void;
  scale?: number;
  colors?: string[];
  border?: string;
}

const MuscleBodyGraph: React.FC<MuscleBodyGraphProps> = ({
  highlightedMuscles = [],
  gender = 'male',
  side = 'front',
  onBodyPartPress,
  scale = 1.5,
  colors = ['#FF3B30', '#FFD60A', '#4CD964'], // Red, Yellow, Green
  border = 'rgba(255,255,255,0.3)',
}) => {
  const handleBodyPartPress = (bodyPart: ExtendedBodyPart, pressedSide?: 'left' | 'right') => {
    if (onBodyPartPress && bodyPart.slug) {
      onBodyPartPress(bodyPart.slug, pressedSide);
    }
  };

  return (
    <View style={styles.container}>
      <Body
        data={highlightedMuscles}
        onBodyPartPress={handleBodyPartPress}
        gender={gender}
        side={side}
        scale={scale}
        colors={colors}
        border={border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 20,
  },
});

export default MuscleBodyGraph; 