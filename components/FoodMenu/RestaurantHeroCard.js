import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import ImageRestaurants from "../ImageRestaurants";
import Map from "../Map";
import { ui } from "../../config/designSystem";
import { foodMenuCopy } from "../../constants/foodMenuCopy";
import RestaurantLogo from "../RestaurantLogo";

const RestaurantHeroCard = ({
  restaurant,
  closingTimes,
  daysOfWeek,
  currentDay,
  commentsLength,
  openUrlInBrowser,
  capitalizeFirstLetter,
  getPriceTier,
  jumpToMenu,
  navigation,
  styles,
  legacyStyles,
}) => {
  const safeRestaurantName = restaurant?.restaurantName || "Restaurant";
  const hasCoordinates =
    Number.isFinite(Number(restaurant?.lat)) &&
    Number.isFinite(Number(restaurant?.long));

  return (
    <View style={styles.restaurantCard}>
      <View style={styles.detailsContainer}>
        <ImageRestaurants
          restaurantName={safeRestaurantName}
          location={restaurant.address}
        />

        <View style={styles.heroRow}>
          <RestaurantLogo
            uri={restaurant.logo}
            name={safeRestaurantName}
            style={styles.logo}
            fallbackStyle={styles.logoPlaceholder}
          />
          <View style={styles.heroInfo}>
            <Text style={styles.restaurantName}>{safeRestaurantName}</Text>

            {!!restaurant.address && (
              <View style={styles.infoRow}>
                <Icon
                  name="pin-outline"
                  size={18}
                  style={styles.infoIcon}
                  color={ui.colors.textMuted}
                />
                <Text style={styles.infoText}>{restaurant.address}</Text>
              </View>
            )}

            {!!restaurant.phone && (
              <View style={styles.infoRow}>
                <Icon
                  name="phone"
                  size={18}
                  style={styles.infoIcon}
                  color={ui.colors.textMuted}
                />
                <Text style={styles.infoText}>{restaurant.phone}</Text>
              </View>
            )}

            {!!restaurant.url && (
              <TouchableOpacity
                onPress={() => openUrlInBrowser(restaurant.url)}
                activeOpacity={0.7}
              >
                <View style={styles.infoRow}>
                  <Icon
                    name="web"
                    size={18}
                    style={styles.infoIcon}
                    color={ui.colors.textMuted}
                  />
                  <Text style={styles.linkText}>{restaurant.url}</Text>
                </View>
              </TouchableOpacity>
            )}

            {!!restaurant.cuisine && (
              <View style={styles.infoRow}>
                <Icon
                  name="silverware-fork-knife"
                  size={18}
                  style={styles.infoIcon}
                  color={ui.colors.textMuted}
                />
                <Text style={styles.infoText}>
                  {capitalizeFirstLetter(restaurant.cuisine)}
                </Text>
              </View>
            )}

            {!!restaurant.price && (
              <View style={styles.infoRow}>
                <Icon
                  name="cash"
                  size={18}
                  style={styles.infoIcon}
                  color={ui.colors.textMuted}
                />
                <Text style={styles.infoText}>{getPriceTier(restaurant.price)}</Text>
              </View>
            )}
          </View>
        </View>

        {!!restaurant.description && restaurant.description.trim().length > 28 && (
          <Text style={styles.restaurantDescription}>{restaurant.description}</Text>
        )}

        <View style={legacyStyles.closingTimes}>
          {closingTimes.map((record, index) => (
            <View key={index}>
              <Text style={legacyStyles.closingTimesText}>Opening Times:</Text>
              <View>
                {daysOfWeek.map((day, dayIndex) => (
                  <Text
                    key={day}
                    style={[
                      legacyStyles.dayText,
                      currentDay === dayIndex ? legacyStyles.currentDayText : null,
                    ]}
                  >
                    {day}: {record.closingTime[day] || "Closed"}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity onPress={() => navigation.navigate("Maps", { restaurant })}>
            <View style={styles.actionRow}>
              <View style={styles.menuList}>
                <Icon
                  name="information"
                  size={20}
                  color="#00CDBC"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.actionLabel}>Info, Maps & Hygiene Rating</Text>
              </View>
              <Icon name="chevron-right" color="#00CDBC" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Reviews", { restaurant })}>
            <View style={styles.actionRow}>
              <View style={styles.menuList}>
                <Icon name="star" size={20} color="#00CDBC" style={{ marginRight: 10 }} />
                <Text style={styles.actionLabel}>See all {commentsLength} reviews</Text>
              </View>
              <Icon name="chevron-right" color="#00CDBC" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={jumpToMenu}>
            <View style={styles.actionRow}>
              <View style={styles.menuList}>
                <Icon name="book" size={20} color="#00CDBC" style={{ marginRight: 10 }} />
                <Text style={styles.actionLabel}>Jump to Menu</Text>
              </View>
              <Icon name="chevron-right" color="#00CDBC" style={styles.chevronIcon} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.mapWrap}>
          {hasCoordinates ? (
            <Map
              latitude={Number(restaurant.lat)}
              longitude={Number(restaurant.long)}
              title={safeRestaurantName}
            />
          ) : (
            <View style={styles.mapFallbackWrap}>
              <Text style={styles.mapFallbackText}>{foodMenuCopy.mapUnavailable}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default React.memo(RestaurantHeroCard);
