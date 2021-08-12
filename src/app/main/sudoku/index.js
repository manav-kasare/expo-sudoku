import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import {
  boardMatches,
  makePuzzle,
  solvePuzzle,
} from "../../../utils/sudoku-factory";
import styles from "./styles";
import _ from "lodash";

export default function Sudoku() {
  const [puzzle, setPuzzle] = useState(makePuzzle);
  console.log(puzzle);

  const onInput = (key, input) => {
    const solved = solvePuzzle(_.flatten(puzzle));
    const gridpoint = key.split("-");
    const x = parseInt(gridpoint[0]);
    const y = parseInt(gridpoint[1]);
    setPuzzle((prev) => {
      const clone = [...prev];
      console.log("at gridpoint", x, y, clone[x]);
      clone[x + y + 1] = parseInt(input);
      return clone;
    });

    if (boardMatches(_.flatten(puzzle), solved)) {
      AlertIOS.alert("Game Solved");
    }
  };

  const handleNewGame = () => {
    setPuzzle(() => makePuzzle());
  };

  const handleSolvePuzzle = () => {
    setPuzzle(() => solvePuzzle(_.flatten(puzzle)));
  };

  const generateBoard = () => {
    let rows = [];
    let blocks = [];
    const _puzzle = _.chunk(puzzle, 9);

    _puzzle.map((row) => {
      const rowSeperator = rows.length == 2 || rows.length == 5 ? true : false;

      row.map((block) => {
        const key = rows.length + "-" + blocks.length;
        const blockSeperator =
          blocks.length == 2 || blocks.length == 5 ? true : false;

        if (block === null) {
          blocks.push(
            <View
              key={key}
              style={[styles.block, blockSeperator && styles.blockSeperator]}
            >
              <TextInput
                clearTextOnFocus={true}
                keyboardType={"number-pad"}
                style={styles.textInput}
                onChangeText={(input) => onInput(key, input)}
              />
            </View>
          );
        } else {
          blocks.push(
            <View
              key={key}
              style={[styles.block, blockSeperator && styles.blockSeperator]}
            >
              <Text style={styles.blockText}>{++block}</Text>
            </View>
          );
        }
      });
      rows.push(
        <View
          key={rows.length}
          style={[styles.row, rowSeperator && styles.rowSeperator]}
        >
          {blocks}
        </View>
      );
      blocks = [];
    });
    return (
      <View key={rows.length} style={styles.container}>
        {rows}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingVertical: 50 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSolvePuzzle}>
          <Text>Solve Puzzle</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Sudoku</Text>
        <TouchableOpacity onPress={handleNewGame}>
          <Text>New Game</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>{generateBoard()}</View>
    </SafeAreaView>
  );
}
