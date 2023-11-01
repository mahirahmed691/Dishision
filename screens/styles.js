import { StyleSheet, Dimensions } from "react-native";

const width = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingRight:10,
    paddingLeft:10,
    paddingBottom:20,
  },
  foodMenuContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor:'#00CDBC',
    paddingTop:50,
    margin:-10,
    paddingRight:10,
  },
  header2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop:50,
    margin:-10,
    alignItems:'center'
  
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
    margin:-10,
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
  menuList: {
    flexDirection: "row",
    marginTop: 10,
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
    height: 50,
    resizeMode: "contain",
    borderRadius: 8,
  },
  restaurantName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#333",
    marginBottom: 5,
    alignSelf: "flex-start",
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
  restaurantLocation: {
    fontSize: 14,
    width: "100%",
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
    justifyContent: "space-between",
  },
  ratingInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: "900",
    marginRight: 10,
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
  favCard: {
    margin: 10,
    width: '95%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,  // This property adds an elevation shadow for Android
  },
  favCardText:{
    fontSize:16,
    fontWeight:'600',
    color:'black',
    marginLeft:5
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
  toggleButton: {
    alignSelf: "center",
  },
  review: {
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
  },
  reviewCount: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 15,
  },
  reviewName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "teal",
  },
  reviewText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111",
    marginTop: 5,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight:30,
    marginLeft:10,
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
    color: "#111",
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
    marginLeft:20,
    marginBottom:20
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  dayText: {
    fontSize: 14,
    color:'black',
    paddingVertical:5,
    backgroundColor:'#f0f0f0',
    paddingLeft:20,
    fontWeight:'500'
  },
  currentDayText: {
    fontWeight: "bold",
    color: "#00CDBC", 
    backgroundColor:'white'
  },
  iconContainer: {
    backgroundColor: "#00CDBC",
    borderRadius: 50,
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
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    marginLeft: 20
  },
  backgroundImage: {
    backgroundColor: "#00CDBC",
    flex: 1,
  },
  addKeywordsButton: {
    backgroundColor: "black",
    width: "80%",
    alignSelf: "center",
    marginTop: 20,
  },
  searchButton: {
    backgroundColor: "white",
  },
  restaurantDescription: {
    margin: 20,
    marginBottom: 20,
    fontSize: 11,
    fontSize: 15,
    fontWeight: "500",
  },
  restaurantMenu: {
    backgroundColor: "white",
    position: "absolute",
    left: 0,
    right: 0,
    top: 30,
    zIndex: 100,
    height: "60%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1,
  },
  closingTimes: {
    backgroundColor: "white",
  },
  closingTimesText: {
    paddingLeft:20,
    paddingBottom:5,
    paddingTop:5,
    fontSize: 18,
    fontWeight: "900",
    color:"white",
    backgroundColor:'#00CDBC',
  },

  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  brandedContainer: {
    marginVertical: 10,
  },
  cuisineHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  restaurantHorizontalList: {
    marginVertical: 10,
  },
  restaurantCardHorizontal: {
    borderRadius: 12,
    marginRight: 12,
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  logoHorizontal: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 10,
  },
  restaurantInfoHorizontal: {
    padding: 10,
  },
  restaurantNameHorizontal: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  restaurantRating: {
    color: "#00CDBC",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  noFoodContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  gif: {
    width: "100%",
    height: 300,
    marginBottom: 20,
  },
  showAllButton: {
    borderColor: "#00CDBC",
  },
  showAllButtonLabel: {
    color: "#00CDBC",
  },
  searchInput: {
    width: "80%",
  },
  locationContainer: {
    flexDirection: "row",
  },
  pickerWrapper: {
    flexDirection: "row",
  },
  pickerContent: {
    marginTop: 10,
    backgroundColor: "#f0f0f0",
  },

  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#00CDBC",
    borderRadius: 8,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
    marginRight: 10,
  },
  pickerContainer: {
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    zIndex: 100, // Adjust the z-index value as needed
  },
  pickerOverlay: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
  },
  pickerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default styles;
