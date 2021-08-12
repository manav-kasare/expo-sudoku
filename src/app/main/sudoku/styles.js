import { StyleSheet, Dimensions } from "react-native";
const { height, width } = Dimensions.get("screen");

export default styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: height * 0.075,
    alignItems: "center",
  },
  headerText: {
    textAlign: "center",
    fontSize: 20,
  },
  container: {
    padding: width * 0.05,
  },
  row: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  rowSeperator: {
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 25,
    backgroundColor: "rgba(0, 0, 255, .1)",
    textAlign: "center",
  },
  block: {
    flex: 1,
    borderWidth: 0.5,
    height: height * 0.05,
    justifyContent: "center",
  },
  blockSeperator: {
    borderRightWidth: 2,
  },
  blockText: {
    fontSize: 25,
    textAlign: "center",
  },
});
