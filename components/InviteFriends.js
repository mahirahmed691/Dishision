import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Share,
  Image,
  StyleSheet,
  Clipboard,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Icon, TextInput, Title } from "react-native-paper";

export const InviteFriends = () => {
  const [signups, setSignups] = useState(12);
  const inviteCode = "ABC123"; // Replace 'ABC123' with your generated invite code

  const [expandSignUp, setExpandSignUp] = useState(false);
  const [expandShare, setExpandShare] = useState(false);
  const [expandSearch, setExpandSearch] = useState(false);
  const [expandCompleted, setExpandCompleted] = useState(false);

  const signUpAchievements = [
    {
      value: 5,
      label: "Bronze Achievement Signup",
      icon: "star",
      color: "#CD7F32",
      points: "10",
    },
    {
      value: 10,
      label: "Silver Achievement Signup",
      icon: "medal",
      color: "#C0C0C0",
      points: "25",
    },
    {
      value: 25,
      label: "Gold Achievement Signup",
      icon: "medal",
      color: "#FFD700",
      points: "50",
    },
    {
      value: 50,
      label: "Platinum Achievement Signup",
      icon: "trophy",
      color: "#E5E4E2",
      points: "100",
    },
    {
      value: 100,
      label: "Diamond Achievement Singup",
      icon: "diamond-stone",
      color: "#ADD8E6",
      points: "200",
    },
  ];

  const shareAchievements = [
    {
      value: 100,
      label: "Bronze Achievement Share",
      icon: "star",
      color: "#CD7F32",
      points: "10",
    },
    {
      value: 250,
      label: "Silver Achievement Share",
      icon: "medal",
      color: "#C0C0C0",
      points: "50",
    },
    {
      value: 500,
      label: "Gold Achievement Share",
      icon: "medal",
      color: "#FFD700",
      points: "100",
    },
    {
      value: 100,
      label: "Platinum Achievement Share",
      icon: "trophy",
      color: "#E5E4E2",
      points: "250",
    },
    {
      value: 2000,
      label: "Diamond Achievement",
      icon: "diamond-stone",
      color: "#ADD8E6",
      points: "500",
    },
  ];

  const searchAchievements = [
    {
      value: 500,
      label: "Bronze Achievement Search",
      icon: "star",
      color: "#CD7F32",
      points: "50",
    },
    {
      value: 1000,
      label: "Silver Achievement Search",
      icon: "medal",
      color: "#C0C0C0",
      points: "100",
    },
    {
      value: 2500,
      label: "Gold Achievement",
      icon: "medal",
      color: "#FFD700",
      points: "250",
    },
    {
      value: 5000,
      label: "Platinum Achievement Search",
      icon: "trophy",
      color: "#E5E4E2",
      points: "500",
    },
    {
      value: 10000,
      label: "Diamond Achievement Search",
      icon: "diamond-stone",
      color: "#ADD8E6",
      points: "1000",
    },
  ];

  const handleExpand = (section) => {
    if (section === "signUp") {
      setExpandSignUp(!expandSignUp);
    } else if (section === "share") {
      setExpandShare(!expandShare);
    } else if (section === "search") {
      setExpandSearch(!expandSearch);
    }
  };

  const renderChevron = (section) => {
    const isExpanded =
      section === "signUp"
        ? expandSignUp
        : section === "share"
        ? expandShare
        : expandSearch;
    return isExpanded ? "chevron-up" : "chevron-down";
  };

  const filterAchievements = (achievements, signups) => {
    return achievements.filter((achievement) => signups < achievement.value);
  };

  const getNextAchievement = (achievements, signups) => {
    const nextAchievement = achievements.find(
      (achievement) => signups < achievement.value
    );
    return nextAchievement ? [nextAchievement] : [];
  };

  const completedAchievements = (achievements, signups) => {
    return achievements.filter((achievement) => signups >= achievement.value);
  };

  const handleInvite = async () => {
    if (inviteCode) {
      try {
        await Share.share({
          message: `Join DishDecide using my invite code: ${inviteCode}`,
        });
        setSignups(signups + 1); // Increment signups on successful share
      } catch (error) {
        Alert.alert("Error", "Failed to share invite code. Please try again.");
      }
    } else {
      Alert.alert("Error", "No valid invite code available.");
    }
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      Clipboard.setString(inviteCode);
      Alert.alert("Copied", "Invite code copied to clipboard!");
    } else {
      Alert.alert("Error", "No valid invite code available.");
    }
  };

  const handleExpandCompleted = () => {
    setExpandCompleted(!expandCompleted);
  };

  const noCompletedAchievements = (
    <Text
      style={{
        textAlign: "center",
        marginTop: 10,
        color: "#111",
        fontSize: 12,
      }}
    >
      No achievements completed yet.
    </Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo4.png")} style={styles.logo} />
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.inviteCode}
            value={inviteCode}
            editable={false}
          />
          <TouchableOpacity onPress={copyToClipboard}>
            <MaterialCommunityIcons
              name="content-copy"
              size={24}
              color="#1e90ff"
              style={styles.copyIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleInvite}>
        <Text style={styles.shareButtonText}>Share Code</Text>
      </TouchableOpacity>

      <ScrollView style={styles.progressBars}>
        <TouchableOpacity onPress={() => handleExpand("signUp")}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Title style={{ fontWeight: "900" }}>Sign-ups</Title>
            <MaterialCommunityIcons
              name={renderChevron("share")}
              size={24}
              color="#00CDBC"
            />
          </View>
        </TouchableOpacity>
        {expandSignUp
          ? filterAchievements(signUpAchievements, signups).map(
              (achievement, index) => (
                <Achievement key={index} signups={signups} data={achievement} />
              )
            )
          : getNextAchievement(signUpAchievements, signups).map(
              (achievement, index) => (
                <Achievement key={index} signups={signups} data={achievement} />
              )
            )}

        <TouchableOpacity onPress={() => handleExpand("share")}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Title style={{ fontWeight: "900" }}>Shares</Title>
            <MaterialCommunityIcons
              name={renderChevron("share")}
              size={24}
              color="#00CDBC"
            />
          </View>
        </TouchableOpacity>
        {expandShare
          ? filterAchievements(shareAchievements, signups).map(
              (achievement, index) => (
                <Achievement key={index} signups={signups} data={achievement} />
              )
            )
          : getNextAchievement(shareAchievements, signups).map(
              (achievement, index) => (
                <Achievement key={index} signups={signups} data={achievement} />
              )
            )}

        <TouchableOpacity onPress={() => handleExpand("search")}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Title style={{ fontWeight: "900" }}>Searches</Title>
            <MaterialCommunityIcons
              name={renderChevron("share")}
              size={24}
              color="#00CDBC"
            />
          </View>
        </TouchableOpacity>
        {expandSearch
          ? filterAchievements(searchAchievements, signups).map(
              (achievement, index) => (
                <Achievement key={index} signups={signups} data={achievement} />
              )
            )
          : getNextAchievement(searchAchievements, signups).map(
              (achievement, index) => (
                <Achievement key={index} signups={signups} data={achievement} />
              )
            )}

        <TouchableOpacity onPress={() => handleExpandCompleted()}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Title style={{ fontWeight: "900" }}>Completed Achievements</Title>
            <MaterialCommunityIcons
              name={expandCompleted ? "chevron-up" : "chevron-down"}
              size={24}
              color="#00CDBC"
            />
          </View>
        </TouchableOpacity>

        {expandCompleted && (
          <ScrollView style={styles.completedBars}>
            {completedAchievements(signUpAchievements, signups).length > 0 &&
              completedAchievements(signUpAchievements, signups).map(
                (achievement, index) => (
                  <Achievement
                    key={index}
                    signups={signups}
                    data={achievement}
                  />
                )
              )}

            {completedAchievements(signUpAchievements, signups).length === 0 &&
              completedAchievements(shareAchievements, signups).length === 0 &&
              completedAchievements(searchAchievements, signups).length === 0 &&
              noCompletedAchievements}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Achievement = ({ signups, data }) => {
  return (
    <View style={styles.progressBar}>
      <View style={styles.achievementHeader}>
        <View style={{ flexDirection: "row" }}>
          <MaterialCommunityIcons
            name={data.icon}
            size={18}
            style={{ marginTop: 5 }}
            color={data.color}
          />
          <Title style={{ fontWeight: "900", marginLeft: 10, fontSize: 15 }}>
            {data.label}
          </Title>
        </View>
        <Text style={{ fontWeight: "800" }}>{data.points} pts</Text>
      </View>
      <Text style={styles.progressBarText}>
        {data.label}:{" "}
        {signups >= data.value
          ? `${data.value}/${data.value}`
          : `${signups}/${data.value}`}
      </Text>
      <View style={styles.progress}>
        <View
          style={{
            backgroundColor: "#00CDBC",
            height: 10,
            width: `${
              signups >= data.value
                ? "100%"
                : `${(signups / data.value) * 100}%`
            }`,
            borderRadius: 5,
          }}
        ></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    padding: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  inviteCode: {
    flex: 1,
    padding: 0,
    fontSize: 18,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  copyIcon: {
    padding: 10,
  },
  shareButton: {
    backgroundColor: "#00CDBC",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBars: {
    width: "100%",
  },
  completedBars: {
    height: 500,
    width: "100%",
  },
  progressBar: {
    backgroundColor: "#FFF",
    paddingRight: 10,
    paddingLeft: 10,
    padding: 5,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  achievementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBarText: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 0,
  },
  progress: {
    backgroundColor: "#eee",
    borderRadius: 5,
    height: 5,
    marginTop: 10,
    overflow: "hidden",
  },
});

export default InviteFriends;