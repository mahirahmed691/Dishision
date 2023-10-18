import { StyleSheet, Dimensions } from "react-native";

const width = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingLeft:20,
    paddingRight:20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontSize: 25,
    fontWeight: "500",
    color: "#333",
  },
  filterContainer: {
    marginBottom: 10,
    flexDirection: "row",
  },
  filterDropdowns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dropdown: {
    flex: 1,
    marginRight: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
    width: width * 0.8,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    paddingTop: 0,
    width: 300,
    marginTop: 80,
  },
  menuHeaderText: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  walletCard: {
    width: 200,
    height: 100,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "white",
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  walletHeaderText: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "700",
  },
  walletHeaderIcon: {
    marginTop: 10,
    marginRight: 30,
  },
  walletAmountText: {
    marginTop: 5,
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "900",
  },
  menuItem: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  menuListText: {
    fontSize: 20,
    fontWeight: "300",
    color: "#333",
    marginLeft: 20,
  },
  foodCard: {
    marginVertical: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
  },
  restaurantImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#333",
    marginBottom: 5,
  },
  cuisine: {
    fontSize: 18,
    color: "#111",
    fontWeight: "700",
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: "#444",
    marginTop: 10,
  },
  location: {
    fontSize: 16,
    color: "#444",
    marginBottom: 5,
    marginTop: 5,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopColor: "lightgray",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  activeTab: {},
  scrollableContent: {
    flex: 1,
  },
  cardRightChevron: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  priceRange: {
    fontSize: 16,
    color: "#444",
  },
  viewMenuButton: {
    marginTop: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingInfo:{
    fontSize:30
  },
  ratingValue:{
    fontSize:30,
    fontWeight:'800'
  },
  rightContent: {
    width: "50%",
    marginRight: 10,
  },
  leftContent: {
    width: "50%",
  },
  cardContent: {
    flexDirection: "row",
  },
  ribbonContainer: {
    position: "absolute",
    top: 0,
    left: 8,
    zIndex: 100,
    backgroundColor: "teal",
    paddingHorizontal: 10,
    paddingVertical: 5,
    overflow: "hidden",
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
    position: "relative",
  },
  emptyResultsText: {
    top: width,
    color: "#111",
    fontWeight: "700",
  },
  gif: {
    width: width,
    height: width,
    resizeMode: "contain",
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 100,
  },
  noFavoritesText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  cardImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    borderRadius: 10,
  },
  cardContent: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: width - 40,
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 20,
  },
  favoriteItemName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  review: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 20,
  },
  reviewName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  reviewText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
    marginTop: 5,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
  },
  searchButtonTouchable: {
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 10,
  },
  apiResponseScrollView: {
    marginTop: 10,
    backgroundColor: "#FFF",
  },
  apiResponseText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
    fontFamily: "Futura",
  },
  loadingIndicator: {
    marginTop: 20,
  },
  snackbar: {
    backgroundColor: "#FF5252",
    marginTop: 10,
  },
  keywordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
  },
  keywordText: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#00CDBC",
    color: "white",
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20,
  },
  commentsLength: {
    fontSize: 16,
    color: "#777",
    marginBottom: 10,
  },
  animatedSearchButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#111",
    marginLeft: 10,
  },
  BottomNavBar: {
    position: "absolute",
    bottom: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemContent: {
    flexDirection: "row",
    justifyContent: "space-between", // Space evenly
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  iconContainer: {
    backgroundColor: "#00CDBC",
    borderRadius: 50, // Make the container circular
    marginRight: 20,
    padding: 10,
  },
  icon: {
    fontSize: 24,
    color: "#fff",
  },
  listItemText: {
    fontSize: 18,
    color: "#333",
    flex: 1, // Allow text to take remaining space
    marginRight: 10, // Add some space between text and chevron
  },
  backButton: {
    marginLeft: 20,
  },
  backgroundImage:{
    backgroundColor:'#00CDBC',
    flex:1,
  },
  addKeywordsButton: {
    backgroundColor:'black',
    width:'80%',
    alignSelf:'center',
    marginTop:20,
  },
  searchButton:{
    backgroundColor:'white',
  }
});

export default styles;
