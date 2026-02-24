import React from "react";
import { ScrollView, View, StyleSheet, Image, Text } from "react-native";

const Branded = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Branded</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675967/file/original-55557a8589041381a2f1e23d3a8c2b24.png?resize=1504x1128",
          }}
        />
        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675970/file/original-af94f6059bdbd2776cea1139c399ac35.png?resize=2048x1536&vertical=center",
          }}
        />

        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675968/file/original-7704fb355eb57d70d988bf63b5dd1874.png?resize=2048x1536&vertical=center",
          }}
        />
        <Image
          style={styles.item}
          source={{
            uri: "https://cdn.dribbble.com/userupload/10675969/file/original-ed4f2470bfe212ebb9f12cfcf5ca9826.png?resize=2048x1536&vertical=center",
          }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollViewContent: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  item: {
    width: 250,
    height: 182,
    backgroundColor: "#D1FAE5",
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
    paddingHorizontal: 12,
  },
});

export default Branded;
