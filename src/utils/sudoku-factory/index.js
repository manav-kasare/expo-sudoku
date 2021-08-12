import _ from "lodash";

const _makePuzzle = (board) => {
  var puzzle = [];
  var deduced = makeArray(81, null);
  var order = _.range(81);

  shuffleArray(order);

  for (var i = 0; i < order.length; i++) {
    var pos = order[i];

    if (deduced[pos] == null) {
      puzzle.push({ pos: pos, num: board[pos] });
      deduced[pos] = board[pos];
      deduce(deduced);
    }
  }

  shuffleArray(puzzle);

  for (var i = puzzle.length - 1; i >= 0; i--) {
    var e = puzzle[i];
    removeElement(puzzle, i);

    var rating = checkPuzzle(boardForEntries(puzzle), board);
    if (rating == -1) {
      puzzle.push(e);
    }
  }

  return boardForEntries(puzzle);
};

export const makePuzzle = () => _makePuzzle(solvePuzzle(makeArray(81, null)))

export export function ratePuzzle(puzzle, samples) {
  var total = 0;

  for (var i = 0; i < samples; i++) {
    var tuple = solveBoard(puzzle);

    if (tuple.answer == null) {
      return -1;
    }

    total += tuple.state.length;
  }

  return total / samples;
}

export function checkPuzzle(puzzle, board) {
  if (board == undefined) {
    board = null;
  }

  var tuple1 = solveBoard(puzzle);
  if (tuple1.answer == null) {
    return -1;
  }

  if (board != null && boardMatches(board, tuple1.answer) == false) {
    return -1;
  }

  var difficulty = tuple1.state.length;
  var tuple2 = solveNext(tuple1.state);

  if (tuple2.answer != null) {
    return -1;
  }

  return difficulty;
}

export function solvePuzzle(board) {
  return solveBoard(board).answer;
}

export function solveBoard(original) {
  var board = [].concat(original);
  var guesses = deduce(board);

  if (guesses == null) {
    return { state: [], answer: board };
  }

  var track = [{ guesses: guesses, count: 0, board: board }];
  return solveNext(track);
}

export function solveNext(remembered) {
  while (remembered.length > 0) {
    var tuple1 = remembered.pop();

    if (tuple1.count >= tuple1.guesses.length) {
      continue;
    }

    remembered.push({
      guesses: tuple1.guesses,
      count: tuple1.count + 1,
      board: tuple1.board,
    });
    var workspace = [].concat(tuple1.board);
    var tuple2 = tuple1.guesses[tuple1.count];

    workspace[tuple2.pos] = tuple2.num;

    var guesses = deduce(workspace);

    if (guesses == null) {
      return { state: remembered, answer: workspace };
    }

    remembered.push({ guesses: guesses, count: 0, board: workspace });
  }

  return { state: [], answer: null };
}

export function deduce(board) {
  while (true) {
    var stuck = true;
    var guess = null;
    var count = 0;

    // fill in any spots determined by direct conflicts
    var tuple1 = figureBits(board);
    var allowed = tuple1.allowed;
    var needed = tuple1.needed;

    for (var pos = 0; pos < 81; pos++) {
      if (board[pos] == null) {
        var numbers = listBits(allowed[pos]);
        if (numbers.length == 0) {
          return [];
        } else if (numbers.length == 1) {
          board[pos] = numbers[0];
          stuck = false;
        } else if (stuck == true) {
          var t = _.map(numbers, function (val, key) {
            return { pos: pos, num: val };
          });

          var tuple2 = pickBetter(guess, count, t);
          guess = tuple2.guess;
          count = tuple2.count;
        }
      }
    }

    if (stuck == false) {
      var tuple3 = figureBits(board);
      allowed = tuple3.allowed;
      needed = tuple3.needed;
    }

    // fill in any spots determined by elimination of other locations
    for (var axis = 0; axis < 3; axis++) {
      for (var x = 0; x < 9; x++) {
        var numbers = listBits(needed[axis * 9 + x]);

        for (var i = 0; i < numbers.length; i++) {
          var n = numbers[i];
          var bit = 1 << n;
          var spots = [];

          for (var y = 0; y < 9; y++) {
            var pos = posFor(x, y, axis);
            if (allowed[pos] & bit) {
              spots.push(pos);
            }
          }

          if (spots.length == 0) {
            return [];
          } else if (spots.length == 1) {
            board[spots[0]] = n;
            stuck = false;
          } else if (stuck) {
            var t = _.map(spots, function (val, key) {
              return { pos: val, num: n };
            });

            var tuple4 = pickBetter(guess, count, t);
            guess = tuple4.guess;
            count = tuple4.count;
          }
        }
      }
    }

    if (stuck == true) {
      if (guess != null) {
        shuffleArray(guess);
      }

      return guess;
    }
  }
}

export function figureBits(board) {
  var needed = [];
  var allowed = _.map(
    board,
    function (val, key) {
      return val == null ? 511 : 0;
    },
    []
  );

  for (var axis = 0; axis < 3; axis++) {
    for (var x = 0; x < 9; x++) {
      var bits = axisMissing(board, x, axis);
      needed.push(bits);

      for (var y = 0; y < 9; y++) {
        var pos = posFor(x, y, axis);
        allowed[pos] = allowed[pos] & bits;
      }
    }
  }

  return { allowed: allowed, needed: needed };
}

export function posFor(x, y, axis) {
  if (axis == undefined) {
    axis = 0;
  }

  if (axis == 0) {
    return x * 9 + y;
  } else if (axis == 1) {
    return y * 9 + x;
  }

  return (
    [0, 3, 6, 27, 30, 33, 54, 57, 60][x] + [0, 1, 2, 9, 10, 11, 18, 19, 20][y]
  );
}

export function axisFor(pos, axis) {
  if (axis == 0) {
    return Math.floor(pos / 9);
  } else if (axis == 1) {
    return pos % 9;
  }

  return Math.floor(pos / 27) * 3 + (Math.floor(pos / 3) % 3);
}

export function axisMissing(board, x, axis) {
  var bits = 0;

  for (var y = 0; y < 9; y++) {
    var e = board[posFor(x, y, axis)];

    if (e != null) {
      bits |= 1 << e;
    }
  }

  return 511 ^ bits;
}

export function listBits(bits) {
  var list = [];
  for (var y = 0; y < 9; y++) {
    if ((bits & (1 << y)) != 0) {
      list.push(y);
    }
  }

  return list;
}

export function allowed(board, pos) {
  var bits = 511;

  for (var axis = 0; axis < 3; axis++) {
    var x = axisFor(pos, axis);
    bits = bits & axisMissing(board, x, axis);
  }

  return bits;
}

// TODO: make sure callers utilize the return value correctly
export function pickBetter(b, c, t) {
  if (b == null || t.length < b.length) {
    return { guess: t, count: 1 };
  } else if (t.length > b.length) {
    return { guess: b, count: c };
  } else if (randomInt(c) == 0) {
    return { guess: t, count: c + 1 };
  }

  return { guess: b, count: c + 1 };
}

export function boardForEntries(entries) {
  var board = _.map(_.range(81), function (val, key) {
    return null;
  });

  for (var i = 0; i < entries.length; i++) {
    var item = entries[i];
    var pos = item.pos;
    var num = item.num;

    board[pos] = num;
  }

  return board;
}

export function boardMatches(b1, b2) {
  for (var i = 0; i < 81; i++) {
    if (b1[i] != b2[i]) {
      return false;
    }
  }

  return true;
}

export function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

export function shuffleArray(original) {
  // Swap each element with another randomly selected one.
  for (var i = 0; i < original.length; i++) {
    var j = i;
    while (j == i) {
      j = Math.floor(Math.random() * original.length);
    }
    var contents = original[i];
    original[i] = original[j];
    original[j] = contents;
  }
}

export function removeElement(array, from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
}

export function makeArray(length, value) {
  return _.map(_.range(length), function (val, key) {
    return value;
  });
}
