import React from "react";
import { ScrollView, View, StyleSheet, Image, Text } from "react-native";

// import { Container } from './styles';

const Branded = () => {
  return (
    <View>
      <Text style={styles.sectionTitle}>Branded</Text>
      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675967/file/original-55557a8589041381a2f1e23d3a8c2b24.png?resize=1504x1128",
          }} // Replace with your image URLs
        />
        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675970/file/original-af94f6059bdbd2776cea1139c399ac35.png?resize=2048x1536&vertical=center",
          }} // Replace with your image URLs
        />

        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675968/file/original-7704fb355eb57d70d988bf63b5dd1874.png?resize=2048x1536&vertical=center",
          }} // Replace with your image URLs
        />
        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675969/file/original-ed4f2470bfe212ebb9f12cfcf5ca9826.png?resize=2048x1536&vertical=center",
          }} // Replace with your image URLs
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexDirection: "row", // Aligns items horizontally
  },
  item: {
    width: 200,
    height: 150,
    margin: 0,
    backgroundColor: "lightblue",
    marginRight: 5,
    marginBottom: 10,
    resizeMode: "cover",
    zIndex: 0,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: "900",
  },
});

export default Branded;
